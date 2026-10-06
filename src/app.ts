import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";
import httpStatus from "http-status";

import AutRoute from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import branchRoutes from "./routes/branchRoutes";
import productRoutes from "./routes/productRoutes";
import cartRoutes from "./routes/cartRoutes";
import orderRouter from "./routes/orderRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import cronRoutes from "./routes/cronRoutes";

import globalErrorHandler from "./middleware/globalErrorHandler";
import notFound from "./middleware/notFound";
import { httpLogger } from "./utils/logger";
import config from "./config";

const app: Application = express();

// ── Trust proxy: 1 hop is enough on Vercel. Trusting "true" opens IP spoofing.
app.set("trust proxy", 1);

// ── Security headers + CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "img-src": [
          "'self'",
          "data:",
          "blob:",
          "https://res.cloudinary.com",
        ],
        "script-src": ["'self'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "connect-src": ["'self'", config.clientUrl],
        "frame-ancestors": ["'none'"],
        "object-src": ["'none'"],
        "base-uri": ["'self'"],
        "form-action": ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);

app.use(httpLogger);

// ── CORS: explicit allowlist, never fall through to *
const allowedOrigins = new Set<string>(
  [
    "http://localhost:3000",
    config.clientUrl,
    "https://x-mart-client.vercel.app",
  ]
    .filter(Boolean)
    .map((o) => o.replace(/\/+$/, ""))
);

/**
 * Payment gateway callbacks.
 *
 * SSLCommerz reaches these by POSTing from its own domain, so the request
 * carries an `Origin` that is deliberately *not* in the allowlist. Rejecting it
 * meant `POST /payment/success/:tranId` never reached the controller and the
 * browser was shown a 500 "Not allowed by CORS" instead of the redirect to the
 * storefront — which is exactly what a customer sees after paying.
 *
 * These endpoints are public webhooks: they authenticate themselves with the
 * transaction id and are re-validated against the gateway's validation API in
 * `PaymentService`, so they neither need nor want browser-origin policy.
 */
const GATEWAY_CALLBACK = /^\/api\/v1\/payment\/(success|fail|cancel|ipn)(\/|$)/;

const isDev = config.nodeEnv !== "production";

/**
 * Local development convenience: allow any loopback or private-LAN origin.
 *
 * Production stays on the strict allowlist. Without this, opening the dev
 * server on its network address (`http://192.168.x.x:3000`, which `next dev`
 * prints) fails every request, because the browser sends that origin and it is
 * not in the list.
 */
const isAllowedDevOrigin = (origin: string): boolean => {
  if (!isDev) return false;

  try {
    const { hostname } = new URL(origin);

    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]" ||
      // Private ranges only, so this cannot be abused to allow any public host.
      /^10\./.test(hostname) ||
      /^192\.168\./.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
    );
  } catch {
    return false;
  }
};

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const normalized = origin.replace(/\/+$/, "");
    if (allowedOrigins.has(normalized)) return callback(null, true);
    if (isAllowedDevOrigin(normalized)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  maxAge: 86400,
};

const corsMiddleware = cors(corsOptions);

app.use((req, res, next) => {
  // Gateway webhooks bypass the browser-origin policy entirely.
  if (GATEWAY_CALLBACK.test(req.path)) return next();

  return corsMiddleware(req, res, next);
});

// ── Body parsers: hard caps + non-extended urlencoded
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
app.use(cookieParser());

// ── NoSQL injection sanitization (after body parsers, before routes)
app.use(mongoSanitize());

// ── Per-route rate limiters (tighter than the global catch-all)
/**
 * Credential-accepting endpoints only.
 *
 * This used to be mounted on all of `/api/v1/auth`, which also swept up
 * `GET /auth/me`. That endpoint is a *read*, called twice on every storefront
 * page render (once by the server `Navbar`, once by the client user provider),
 * so the 20-request budget was gone after ~10 page views — and because
 * express-rate-limit keys on IP by default, one browser exhausting the bucket
 * locked every other user behind the same NAT/office IP out of auth entirely.
 *
 * Limiting only the endpoints that accept a password is both safer (this is
 * where credential stuffing happens) and no longer self-inflicted.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many auth attempts, slow down" },
  standardHeaders: true,
  legacyHeaders: false,
  // Key on the submitted email as well as the IP, so one abusive client
  // cannot burn a shared NAT bucket and one user cannot lock out another.
  //
  // `ipKeyGenerator` is required here: passing `req.ip` straight through
  // collapses the whole /64 IPv6 subnet into a single key for IPv4-style
  // counting only — an IPv6 client could rotate addresses inside its subnet
  // and never hit the limit. The helper normalises v6 to its subnet, and v4
  // passes through unchanged. See ERR_ERL_KEY_GEN_IPV6.
  keyGenerator: (req) => {
    const email =
      (req.body as { email?: string } | undefined)?.email?.toLowerCase() ?? "";
    return `${ipKeyGenerator(req.ip ?? "")}:${email}`;
  },
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many payment attempts" },
  standardHeaders: true,
  legacyHeaders: false,
});

const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: { success: false, message: "Search rate limit exceeded" },
  standardHeaders: true,
  legacyHeaders: false,
});

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

// Only /init is user-triggered. The success/fail/cancel/ipn callbacks come
// from SSLCommerz's shared gateway IPs, so they must not eat this budget.
//
// The auth limiter is mounted per-endpoint rather than on the whole
// `/api/v1/auth` prefix, so that authenticated reads (`/auth/me`,
// `/auth/refresh-token`) fall through to the global budget instead of
// competing with login attempts. See the note on `authLimiter` above.
app.post("/api/v1/auth/register", authLimiter);
app.post("/api/v1/auth/login", authLimiter);
app.post("/api/v1/auth/change-password", authLimiter);
app.use("/api/v1/payment/init", paymentLimiter);
app.use("/api/v1/products", searchLimiter);
app.use("/api", globalLimiter);

// ── Routes
app.use("/api/v1/auth", AutRoute);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/branches", branchRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/payment", paymentRoutes);
// cron is mounted under /api/v1 to keep a single versioned surface; the cron
// path in vercel.json now matches the actual mounted path.
app.use("/api/v1/cron", cronRoutes);

app.get("/api/v1/health", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mongoose = await import("mongoose");
    const dbState = mongoose.default.connection.readyState; // 1 = connected
    res.status(dbState === 1 ? httpStatus.OK : httpStatus.SERVICE_UNAVAILABLE).json({
      success: dbState === 1,
      message: dbState === 1 ? "healthy" : "database not connected",
      data: { db: dbState, uptime: process.uptime() },
    });
  } catch (err) {
    next(err);
  }
});

app.get("/", (req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: "Welcome to the x-mart api",
  });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;

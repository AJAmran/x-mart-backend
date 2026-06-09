import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
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

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const normalized = origin.replace(/\/+$/, "");
      if (allowedOrigins.has(normalized)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    maxAge: 86400,
  })
);

// ── Body parsers: hard caps + non-extended urlencoded
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
app.use(cookieParser());

// ── NoSQL injection sanitization (after body parsers, before routes)
app.use(mongoSanitize());

// ── Per-route rate limiters (tighter than the global catch-all)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many auth attempts, slow down" },
  standardHeaders: true,
  legacyHeaders: false,
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

app.use("/api/v1/auth", authLimiter);
app.use("/api/v1/payment", paymentLimiter);
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

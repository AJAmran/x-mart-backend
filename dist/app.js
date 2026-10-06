"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importStar(require("express-rate-limit"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const http_status_1 = __importDefault(require("http-status"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const branchRoutes_1 = __importDefault(require("./routes/branchRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const cartRoutes_1 = __importDefault(require("./routes/cartRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const cronRoutes_1 = __importDefault(require("./routes/cronRoutes"));
const globalErrorHandler_1 = __importDefault(require("./middleware/globalErrorHandler"));
const notFound_1 = __importDefault(require("./middleware/notFound"));
const logger_1 = require("./utils/logger");
const config_1 = __importDefault(require("./config"));
const app = (0, express_1.default)();
// ── Trust proxy: 1 hop is enough on Vercel. Trusting "true" opens IP spoofing.
app.set("trust proxy", 1);
// ── Security headers + CSP
app.use((0, helmet_1.default)({
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
            "connect-src": ["'self'", config_1.default.clientUrl],
            "frame-ancestors": ["'none'"],
            "object-src": ["'none'"],
            "base-uri": ["'self'"],
            "form-action": ["'self'"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));
app.use(logger_1.httpLogger);
// ── CORS: explicit allowlist, never fall through to *
const allowedOrigins = new Set([
    "http://localhost:3000",
    config_1.default.clientUrl,
    "https://x-mart-client.vercel.app",
]
    .filter(Boolean)
    .map((o) => o.replace(/\/+$/, "")));
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
const isDev = config_1.default.nodeEnv !== "production";
/**
 * Local development convenience: allow any loopback or private-LAN origin.
 *
 * Production stays on the strict allowlist. Without this, opening the dev
 * server on its network address (`http://192.168.x.x:3000`, which `next dev`
 * prints) fails every request, because the browser sends that origin and it is
 * not in the list.
 */
const isAllowedDevOrigin = (origin) => {
    if (!isDev)
        return false;
    try {
        const { hostname } = new URL(origin);
        return (hostname === "localhost" ||
            hostname === "127.0.0.1" ||
            hostname === "[::1]" ||
            // Private ranges only, so this cannot be abused to allow any public host.
            /^10\./.test(hostname) ||
            /^192\.168\./.test(hostname) ||
            /^172\.(1[6-9]|2\d|3[01])\./.test(hostname));
    }
    catch {
        return false;
    }
};
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        const normalized = origin.replace(/\/+$/, "");
        if (allowedOrigins.has(normalized))
            return callback(null, true);
        if (isAllowedDevOrigin(normalized))
            return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    maxAge: 86400,
};
const corsMiddleware = (0, cors_1.default)(corsOptions);
app.use((req, res, next) => {
    // Gateway webhooks bypass the browser-origin policy entirely.
    if (GATEWAY_CALLBACK.test(req.path))
        return next();
    return corsMiddleware(req, res, next);
});
// ── Body parsers: hard caps + non-extended urlencoded
app.use(express_1.default.json({ limit: "100kb" }));
app.use(express_1.default.urlencoded({ extended: false, limit: "100kb" }));
app.use((0, cookie_parser_1.default)());
// ── NoSQL injection sanitization (after body parsers, before routes)
app.use((0, express_mongo_sanitize_1.default)());
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
const authLimiter = (0, express_rate_limit_1.default)({
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
        const email = req.body?.email?.toLowerCase() ?? "";
        return `${(0, express_rate_limit_1.ipKeyGenerator)(req.ip ?? "")}:${email}`;
    },
});
const paymentLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: "Too many payment attempts" },
    standardHeaders: true,
    legacyHeaders: false,
});
const searchLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000,
    max: 60,
    message: { success: false, message: "Search rate limit exceeded" },
    standardHeaders: true,
    legacyHeaders: false,
});
const globalLimiter = (0, express_rate_limit_1.default)({
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
app.use("/api/v1/auth", authRoutes_1.default);
app.use("/api/v1/user", userRoutes_1.default);
app.use("/api/v1/branches", branchRoutes_1.default);
app.use("/api/v1/products", productRoutes_1.default);
app.use("/api/v1/cart", cartRoutes_1.default);
app.use("/api/v1/orders", orderRoutes_1.default);
app.use("/api/v1/payment", paymentRoutes_1.default);
// cron is mounted under /api/v1 to keep a single versioned surface; the cron
// path in vercel.json now matches the actual mounted path.
app.use("/api/v1/cron", cronRoutes_1.default);
app.get("/api/v1/health", async (req, res, next) => {
    try {
        const mongoose = await import("mongoose");
        const dbState = mongoose.default.connection.readyState; // 1 = connected
        res.status(dbState === 1 ? http_status_1.default.OK : http_status_1.default.SERVICE_UNAVAILABLE).json({
            success: dbState === 1,
            message: dbState === 1 ? "healthy" : "database not connected",
            data: { db: dbState, uptime: process.uptime() },
        });
    }
    catch (err) {
        next(err);
    }
});
app.get("/", (req, res) => {
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Welcome to the x-mart api",
    });
});
app.use(globalErrorHandler_1.default);
app.use(notFound_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
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
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        const normalized = origin.replace(/\/+$/, "");
        if (allowedOrigins.has(normalized))
            return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    maxAge: 86400,
}));
// ── Body parsers: hard caps + non-extended urlencoded
app.use(express_1.default.json({ limit: "100kb" }));
app.use(express_1.default.urlencoded({ extended: false, limit: "100kb" }));
app.use((0, cookie_parser_1.default)());
// ── NoSQL injection sanitization (after body parsers, before routes)
app.use((0, express_mongo_sanitize_1.default)());
// ── Per-route rate limiters (tighter than the global catch-all)
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: "Too many auth attempts, slow down" },
    standardHeaders: true,
    legacyHeaders: false,
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
app.use("/api/v1/auth", authLimiter);
app.use("/api/v1/payment", paymentLimiter);
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
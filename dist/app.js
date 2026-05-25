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
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const branchRoutes_1 = __importDefault(require("./routes/branchRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const cartRoutes_1 = __importDefault(require("./routes/cartRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const http_status_1 = __importDefault(require("http-status"));
const globalErrorHandler_1 = __importDefault(require("./middleware/globalErrorHandler"));
const notFound_1 = __importDefault(require("./middleware/notFound"));
require("./utils/cronJobs");
const logger_1 = require("./utils/logger");
const app = (0, express_1.default)();
// Security headers
app.use((0, helmet_1.default)());
// Request logging
app.use(logger_1.httpLogger);
// CORS configuration
const allowedOrigins = [
    "http://localhost:3000",
    "https://x-mart-client.vercel.app",
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));
// Rate limiting
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: "Too many requests, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
});
const globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use("/api/v1/auth", authLimiter);
app.use("/api", globalLimiter);
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: "10kb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10kb" }));
// NoSQL injection sanitization
app.use((0, express_mongo_sanitize_1.default)());
app.use("/api/v1/auth", authRoutes_1.default);
app.use("/api/v1/user", userRoutes_1.default);
app.use("/api/v1/branches", branchRoutes_1.default);
app.use("/api/v1/products", productRoutes_1.default);
app.use("/api/v1/cart", cartRoutes_1.default);
app.use("/api/v1/orders", orderRoutes_1.default);
app.use("/api/v1/payment", paymentRoutes_1.default);
//Testing
app.get("/", (req, res) => {
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Welcome to the x-mart api",
    });
});
//global error handler
app.use(globalErrorHandler_1.default);
//handle not found
app.use(notFound_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map
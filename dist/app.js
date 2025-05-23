"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const cartRoutes_1 = __importDefault(require("./routes/cartRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const http_status_1 = __importDefault(require("http-status"));
const globalErrorHandler_1 = __importDefault(require("./middleware/globalErrorHandler"));
const notFound_1 = __importDefault(require("./middleware/notFound"));
require("./utils/cronJobs");
const app = (0, express_1.default)();
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
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/api/v1/auth", authRoutes_1.default);
app.use("/api/v1/user", userRoutes_1.default);
app.use("/api/v1/products", productRoutes_1.default);
app.use("/api/v1/cart", cartRoutes_1.default);
app.use("/api/v1/orders", orderRoutes_1.default);
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

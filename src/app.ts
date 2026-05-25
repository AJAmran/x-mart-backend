import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import AutRoute from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import branchRoutes from "./routes/branchRoutes";
import productRoutes from "./routes/productRoutes";
import cartRoutes from "./routes/cartRoutes";
import orderRouter from "./routes/orderRoutes";
import cookieParser from "cookie-parser";
import httpStatus from "http-status";
import globalErrorHandler from "./middleware/globalErrorHandler";
import notFound from "./middleware/notFound";
import "./utils/cronJobs";
import { logger, httpLogger } from "./utils/logger";

const app: Application = express();

// Security headers
app.use(helmet());

// Request logging
app.use(httpLogger);

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "https://x-mart-client.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/v1/auth", authLimiter);
app.use("/api", globalLimiter);

app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// NoSQL injection sanitization
app.use(mongoSanitize());

app.use("/api/v1/auth", AutRoute);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/branches", branchRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders", orderRouter);

//Testing
app.get("/", (req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: "Welcome to the x-mart api",
  });
});

//global error handler
app.use(globalErrorHandler);

//handle not found
app.use(notFound);

export default app;

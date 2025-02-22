import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import AutRoute from "./routes/authRoutes";
import cookieParser from "cookie-parser";
import httpStatus from "http-status";
import globalErrorHandler from "./middleware/globalErrorHandler";
import notFound from "./middleware/notFound";

const app: Application = express();

// CORS configuration
const allowedOrigins = ["http://localhost:3000", "https://yourdomain.com"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies and authorization headers
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/auth", AutRoute);

//Testing
app.get("/", (req: Request, res: Response, next: NextFunction) => {
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

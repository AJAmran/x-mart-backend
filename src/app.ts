import express, { Application, Request, Response } from "express";
import cors from "cors";
import AutRoute from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import cookieParser from "cookie-parser";
import httpStatus from "http-status";
import globalErrorHandler from "./middleware/globalErrorHandler";
import notFound from "./middleware/notFound";
import "./utils/cronJobs";

const app: Application = express();

// CORS configuration
const allowedOrigins = ["http://localhost:3000", "https://x-mart-client.vercel.app"];

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

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/auth", AutRoute);
app.use("/api/v1/products", productRoutes);

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

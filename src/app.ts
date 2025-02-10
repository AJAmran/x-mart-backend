import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import AutRoute from "./routes/authRoutes";
import cookieParser from "cookie-parser";
import httpStatus from "http-status";

const app: Application = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/auth", AutRoute);


//Testing
app.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Welcome to the Lost And Found API',
  });
});



export default app;

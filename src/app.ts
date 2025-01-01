import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import productRoutes from "./routes/productRoutes";
const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use("/api/products", productRoutes);

app.use((err: any, req: any, res: any, next: any) => {
  res.status(err.status || 500).json({ error: err.message });
});

app.get("/", (req: Request, res: Response) => {
  res.send("Helssssslo World!");
});

export default app;

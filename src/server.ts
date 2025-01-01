import { Server } from "http";
import app from "./app";
import mongoose from "mongoose";

import config from "../src/config";

let server: Server;

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception", error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
  if (server) {
    server.close(() => {
      console.error("Server closed to unhandled rejection");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

async function bootstrap() {
  try {
    if (!config.mongoUri || !config.port) {
      throw new Error("Environment variables are missing or invalid");
    }

    await mongoose.connect(config.mongoUri as string);
    console.log("🛢 Database connected successfully");
    server = app.listen(config.port, () => {
      console.log(`🚀 Application is running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
}

bootstrap();
const shutdown = async (signal: string) => {
  console.log(`${signal} received`);
  if (server) {
    server.close(() => {
      console.log("Server closed");
    });
  }
  await mongoose.disconnect();
  console.log("Database disconnected");
  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

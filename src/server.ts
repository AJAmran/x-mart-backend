import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import config from "./config";
import { logger } from "./utils/logger";

let server: Server;

process.on("uncaughtException", (error) => {
  logger.error({ err: error }, "Uncaught Exception");
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  logger.error({ err: error }, "Unhandled Rejection");
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

async function bootstrap() {
  try {
    if (!config.mongoUri || !config.port) {
      throw new Error("Environment variables are missing or invalid");
    }

    // C-06 FIX: explicit pool sizing + timeouts. Required for serverless runtimes
    // (Vercel) where functions spin up and tear down frequently.
    await mongoose.connect(config.mongoUri, {
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      autoIndex: config.nodeEnv !== "production",
    } as mongoose.ConnectOptions);

    logger.info("Database connected successfully");

    server = app.listen(config.port, () => {
      logger.info(`Application is running on port ${config.port}`);
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to connect to database");
    process.exit(1);
  }
}

bootstrap();

const shutdown = async (signal: string) => {
  logger.info(`${signal} received`);
  if (server) {
    server.close(() => logger.info("HTTP server closed"));
  }
  await mongoose.disconnect();
  logger.info("Database disconnected");
  process.exit(0);
};

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

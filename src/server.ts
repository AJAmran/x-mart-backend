import { Server } from "http";
import app from "./app";
import mongoose from "mongoose";
import config from "./config";
import { logger } from "./utils/logger";

let server: Server;

process.on("uncaughtException", (error) => {
  logger.error(error, "Uncaught Exception");
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  logger.error(error, "Unhandled Rejection");
  if (server) {
    server.close(() => {
      logger.error("Server closed due to unhandled rejection");
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

    await mongoose.connect(
      config.mongoUri
    );
    logger.info("Database connected successfully");
    server = app.listen(config.port, () => {
      logger.info(`Application is running on port ${config.port}`);
    });
  } catch (error) {
    logger.error(error, "Failed to connect to database");
    process.exit(1);
  }
}

bootstrap();
const shutdown = async (signal: string) => {
  logger.info(`${signal} received`);
  if (server) {
    server.close(() => {
      logger.info("Server closed");
    });
  }
  await mongoose.disconnect();
  logger.info("Database disconnected");
  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./config"));
const logger_1 = require("./utils/logger");
let server;
process.on("uncaughtException", (error) => {
    logger_1.logger.error({ err: error }, "Uncaught Exception");
    process.exit(1);
});
process.on("unhandledRejection", (error) => {
    logger_1.logger.error({ err: error }, "Unhandled Rejection");
    if (server) {
        server.close(() => process.exit(1));
    }
    else {
        process.exit(1);
    }
});
async function bootstrap() {
    try {
        if (!config_1.default.mongoUri || !config_1.default.port) {
            throw new Error("Environment variables are missing or invalid");
        }
        // C-06 FIX: explicit pool sizing + timeouts. Required for serverless runtimes
        // (Vercel) where functions spin up and tear down frequently.
        await mongoose_1.default.connect(config_1.default.mongoUri, {
            maxPoolSize: 10,
            minPoolSize: 1,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            autoIndex: config_1.default.nodeEnv !== "production",
        });
        logger_1.logger.info("Database connected successfully");
        server = app_1.default.listen(config_1.default.port, () => {
            logger_1.logger.info(`Application is running on port ${config_1.default.port}`);
        });
    }
    catch (error) {
        logger_1.logger.error({ err: error }, "Failed to connect to database");
        process.exit(1);
    }
}
bootstrap();
const shutdown = async (signal) => {
    logger_1.logger.info(`${signal} received`);
    if (server) {
        server.close(() => logger_1.logger.info("HTTP server closed"));
    }
    await mongoose_1.default.disconnect();
    logger_1.logger.info("Database disconnected");
    process.exit(0);
};
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
//# sourceMappingURL=server.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("./config"));
const logger_1 = require("./utils/logger");
let server;
process.on("uncaughtException", (error) => {
    logger_1.logger.error(error, "Uncaught Exception");
    process.exit(1);
});
process.on("unhandledRejection", (error) => {
    logger_1.logger.error(error, "Unhandled Rejection");
    if (server) {
        server.close(() => {
            logger_1.logger.error("Server closed due to unhandled rejection");
            process.exit(1);
        });
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
        await mongoose_1.default.connect(config_1.default.mongoUri);
        logger_1.logger.info("Database connected successfully");
        server = app_1.default.listen(config_1.default.port, () => {
            logger_1.logger.info(`Application is running on port ${config_1.default.port}`);
        });
    }
    catch (error) {
        logger_1.logger.error(error, "Failed to connect to database");
        process.exit(1);
    }
}
bootstrap();
const shutdown = async (signal) => {
    logger_1.logger.info(`${signal} received`);
    if (server) {
        server.close(() => {
            logger_1.logger.info("Server closed");
        });
    }
    await mongoose_1.default.disconnect();
    logger_1.logger.info("Database disconnected");
    process.exit(0);
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
//# sourceMappingURL=server.js.map
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("../src/config"));
let server;
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
    }
    else {
        process.exit(1);
    }
});
function bootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!config_1.default.mongoUri || !config_1.default.port) {
                throw new Error("Environment variables are missing or invalid");
            }
            yield mongoose_1.default.connect(config_1.default.mongoUri);
            console.log("🛢 Database connected successfully");
            server = app_1.default.listen(config_1.default.port, () => {
                console.log(`🚀 Application is running on port ${config_1.default.port}`);
            });
        }
        catch (error) {
            console.error("Failed to connect to database:", error);
            process.exit(1);
        }
    });
}
bootstrap();
const shutdown = (signal) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${signal} received`);
    if (server) {
        server.close(() => {
            console.log("Server closed");
        });
    }
    yield mongoose_1.default.disconnect();
    console.log("Database disconnected");
    process.exit(0);
});
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

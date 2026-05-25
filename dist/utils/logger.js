"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpLogger = exports.logger = void 0;
const pino_1 = __importDefault(require("pino"));
const pino_http_1 = __importDefault(require("pino-http"));
const config_1 = __importDefault(require("../config"));
exports.logger = (0, pino_1.default)({
    level: config_1.default.nodeEnv === "production" ? "info" : "debug",
    transport: config_1.default.nodeEnv !== "production"
        ? { target: "pino/file", options: { destination: 1 } }
        : undefined,
    redact: ["req.headers.authorization", "req.headers.cookie", "body.password"],
});
exports.httpLogger = (0, pino_http_1.default)({
    logger: exports.logger,
    autoLogging: {
        ignore: (req) => req.url === "/favicon.ico" || req.url === "/",
    },
});
//# sourceMappingURL=logger.js.map
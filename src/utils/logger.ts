import pino from "pino";
import pinoHttp from "pino-http";
import config from "../config";

export const logger = pino({
  level: config.nodeEnv === "production" ? "info" : "debug",
  transport:
    config.nodeEnv !== "production"
      ? { target: "pino/file", options: { destination: 1 } }
      : undefined,
  redact: ["req.headers.authorization", "req.headers.cookie", "body.password"],
});

export const httpLogger = pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => req.url === "/favicon.ico" || req.url === "/",
  },
});

import { ErrorRequestHandler } from "express";
import { logger } from "../utils/logger";
import { TErrorSources } from "../interface/errorInterface";
import { deleteImageFromCloudinary } from "../utils/deleteImage";
import { ZodError } from "zod";
import handleZodError from "../error/handleZodError";
import handleValidationError from "../error/handleValidationError";
import handleCastError from "../error/handleCastError";
import handleDuplicateError from "../error/handlerDuplicateError";
import AppError from "../error/AppErros";
import config from "../config";
import { TImageFiles } from "../interface/imageInterface";

const globalErrorHandler: ErrorRequestHandler = async (err, req, res, _next) => {
  // Initialize defaults that the rest of the branches override
  let statusCode = 500;
  let message = "Something went wrong!";
  let errorSources: TErrorSources = [
    { path: "", message: "Something went wrong" },
  ];

  if (req.files && Object.keys(req.files).length > 0) {
    await deleteImageFromCloudinary(req.files as TImageFiles);
  }

  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (err?.name === "ValidationError") {
    const simplifiedError = handleValidationError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (err?.name === "CastError") {
    const simplifiedError = handleCastError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (err?.code === 11000) {
    const simplifiedError = handleDuplicateError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (err?.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Access token expired";
    errorSources = [{ path: "token", message: "expired" }];
  } else if (err?.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid access token";
    errorSources = [{ path: "token", message: "invalid" }];
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = [{ path: "", message: err.message }];
  } else if (err instanceof Error) {
    message = err.message;
    errorSources = [{ path: "", message: err.message }];
  }

  // Log with the request id (pino-http child logger) for correlation
  logger.error(
    { err, statusCode, message, path: req.path, method: req.method },
    "Global error handler"
  );

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    // Never echo the raw error or stack in production
    stack: config.nodeEnv === "development" ? err?.stack : null,
  });
};

export default globalErrorHandler;

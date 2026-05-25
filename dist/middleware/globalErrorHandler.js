"use strict";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../utils/logger");
const deleteImage_1 = require("../utils/deleteImage");
const zod_1 = require("zod");
const handleZodError_1 = __importDefault(require("../error/handleZodError"));
const handleValidationError_1 = __importDefault(require("../error/handleValidationError"));
const handleCastError_1 = __importDefault(require("../error/handleCastError"));
const handlerDuplicateError_1 = __importDefault(require("../error/handlerDuplicateError"));
const AppErros_1 = __importDefault(require("../error/AppErros"));
const config_1 = __importDefault(require("../config"));
const globalErrorHandler = async (err, req, res, next) => {
    //setting default values
    let statusCode = 500;
    let message = "Something went wrong!";
    let errorSources = [
        {
            path: "",
            message: "Something went wrong",
        },
    ];
    if (req.files && Object.keys(req.files).length > 0) {
        await (0, deleteImage_1.deleteImageFromCloudinary)(req.files);
    }
    if (err instanceof zod_1.ZodError) {
        const simplifiedError = (0, handleZodError_1.default)(err);
        statusCode = simplifiedError?.statusCode;
        message = simplifiedError?.message;
        errorSources = simplifiedError?.errorSources;
    }
    else if (err?.name === "ValidationError") {
        const simplifiedError = (0, handleValidationError_1.default)(err);
        statusCode = simplifiedError?.statusCode;
        message = simplifiedError?.message;
        errorSources = simplifiedError?.errorSources;
    }
    else if (err?.name === "CastError") {
        const simplifiedError = (0, handleCastError_1.default)(err);
        statusCode = simplifiedError?.statusCode;
        message = simplifiedError?.message;
        errorSources = simplifiedError?.errorSources;
    }
    else if (err?.code === 11000) {
        const simplifiedError = (0, handlerDuplicateError_1.default)(err);
        statusCode = simplifiedError?.statusCode;
        message = simplifiedError?.message;
        errorSources = simplifiedError?.errorSources;
    }
    else if (err instanceof AppErros_1.default) {
        statusCode = err?.statusCode;
        message = err.message;
        errorSources = [
            {
                path: "",
                message: err?.message,
            },
        ];
    }
    else if (err instanceof Error) {
        message = err.message;
        errorSources = [
            {
                path: "",
                message: err?.message,
            },
        ];
    }
    logger_1.logger.error({ err, statusCode, message }, "Global error handler");
    return res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        err,
        stack: config_1.default.NODE_ENV === "development" ? err?.stack : null,
    });
};
exports.default = globalErrorHandler;
//# sourceMappingURL=globalErrorHandler.js.map
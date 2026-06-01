"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthControllers = void 0;
const config_1 = __importDefault(require("../config"));
const authService_1 = require("../services/authService");
const catchAsync_1 = require("../utils/catchAsync");
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const setRefreshTokenCookie = (res, refreshToken) => {
    const isProduction = config_1.default.nodeEnv === "production";
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        // SameSite=None is required for cross-domain cookie delivery on Vercel
        // (x-mart-client.vercel.app → x-mart-backend.vercel.app).
        // SameSite=Strict silently drops the cookie on cross-site requests.
        sameSite: isProduction ? "none" : "lax",
        secure: isProduction, // SameSite=None MUST pair with Secure=true
        path: "/", // widened from "/api/v1/auth" — Vercel serverless needs it
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};
const registerUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await authService_1.AuthService.registerUser(req.body);
    setRefreshTokenCookie(res, result.refreshToken);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User registered successfully",
        data: { accessToken: result.accessToken },
    });
});
const loginUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await authService_1.AuthService.loginUser(req.body);
    setRefreshTokenCookie(res, result.refreshToken);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User logged in successfully",
        data: { accessToken: result.accessToken },
    });
});
const changePassword = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { ...passwordData } = req.body;
    const result = await authService_1.AuthService.changePassword(req.user, passwordData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Password updated successfully!',
        data: result,
    });
});
const refreshToken = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { refreshToken } = req.cookies;
    const result = await authService_1.AuthService.refreshToken(refreshToken);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Access token retried successfully",
        data: result,
    });
});
exports.AuthControllers = {
    registerUser,
    loginUser,
    changePassword,
    refreshToken,
};
//# sourceMappingURL=authController.js.map
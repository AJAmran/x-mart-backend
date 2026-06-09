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
const isProduction = config_1.default.nodeEnv === "production";
// C-10 FIX: both tokens are now httpOnly + Secure + SameSite=None. The browser
// keeps them off-limits to JS (XSS can't steal them) and they are sent on
// cross-site redirects between the Vercel subdomains.
const setAuthCookies = (res, tokens) => {
    const common = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
    };
    res.cookie("accessToken", tokens.accessToken, {
        ...common,
        maxAge: 15 * 60 * 1000, // 15 min — matches access token expiry
    });
    res.cookie("refreshToken", tokens.refreshToken, {
        ...common,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
};
const clearAuthCookies = (res) => {
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });
};
const registerUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await authService_1.AuthService.registerUser(req.body);
    setAuthCookies(res, result);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User registered successfully",
        data: { user: result.user },
    });
});
const loginUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await authService_1.AuthService.loginUser(req.body);
    setAuthCookies(res, result);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User logged in successfully",
        data: { user: result.user },
    });
});
const changePassword = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const passwordData = req.body;
    const result = await authService_1.AuthService.changePassword(req.user, passwordData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Password updated successfully!",
        data: result,
    });
});
const refreshToken = (0, catchAsync_1.catchAsync)(async (req, res) => {
    // The refresh token arrives via the httpOnly cookie, not the request body
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.UNAUTHORIZED,
            success: false,
            message: "Refresh token missing",
            data: null,
        });
    }
    const result = await authService_1.AuthService.refreshToken(refreshToken);
    setAuthCookies(res, result);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Access token refreshed",
        data: { user: result.user },
    });
});
const logout = (0, catchAsync_1.catchAsync)(async (req, res) => {
    clearAuthCookies(res);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Logged out",
        data: null,
    });
});
const getMe = (0, catchAsync_1.catchAsync)(async (req, res) => {
    // The auth middleware has already attached req.user. Echo it back safely.
    const { _id, name, email, mobileNumber, role, status, profilePhoto } = req.user;
    if (!_id) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.UNAUTHORIZED,
            success: false,
            message: "Not authenticated",
            data: null,
        });
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Current user",
        data: { user: { _id, name, email, mobileNumber, role, status, profilePhoto } },
    });
});
exports.AuthControllers = {
    registerUser,
    loginUser,
    changePassword,
    refreshToken,
    logout,
    getMe,
};
//# sourceMappingURL=authController.js.map
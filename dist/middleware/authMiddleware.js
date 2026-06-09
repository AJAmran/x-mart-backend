"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lru_cache_1 = require("lru-cache");
const catchAsync_1 = require("../utils/catchAsync");
const AppErros_1 = __importDefault(require("../error/AppErros"));
const http_status_1 = __importDefault(require("http-status"));
const VerifyJWt_1 = require("../utils/VerifyJWt");
const config_1 = __importDefault(require("../config"));
const User_1 = require("../models/User");
const userCache = new lru_cache_1.LRUCache({
    max: 1000,
    ttl: 30000,
});
const auth = (...requiredRoles) => {
    return (0, catchAsync_1.catchAsync)(async (req, res, next) => {
        // High-priority fix: accept the access token from the Authorization header
        // (server-to-server, mobile, SPA fallback) OR the httpOnly cookie that the
        // web app now sets. The browser sends the cookie automatically with
        // credentials: "include".
        const authHeader = req.headers.authorization;
        const cookieToken = req.cookies?.accessToken;
        const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
        const token = headerToken || cookieToken;
        if (!token) {
            throw new AppErros_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized access");
        }
        let decoded;
        try {
            decoded = (0, VerifyJWt_1.verifyToken)(token, config_1.default.jwtSecret);
        }
        catch (err) {
            // High-priority: handle JWT errors explicitly instead of letting them
            // become 500s via the generic error path.
            const code = err.name;
            if (code === "TokenExpiredError") {
                throw new AppErros_1.default(http_status_1.default.UNAUTHORIZED, "Access token expired");
            }
            if (code === "JsonWebTokenError") {
                throw new AppErros_1.default(http_status_1.default.UNAUTHORIZED, "Invalid access token");
            }
            throw new AppErros_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized access");
        }
        const { role, email, iat, _id: tokenUserId } = decoded;
        if (!email) {
            throw new AppErros_1.default(http_status_1.default.UNAUTHORIZED, "Invalid token payload");
        }
        const cacheKey = email.toLowerCase();
        let cached = userCache.get(cacheKey);
        if (!cached) {
            const user = await User_1.User.isUserExistsByEmail(email);
            if (!user) {
                throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "User not found");
            }
            cached = {
                _id: String(user._id),
                email: user.email,
                role: user.role,
                status: user.status,
                passwordChangedAt: user.passwordChangedAt ?? null,
            };
            userCache.set(cacheKey, cached);
        }
        if (cached.status === "BLOCKED") {
            throw new AppErros_1.default(http_status_1.default.FORBIDDEN, "This user is blocked");
        }
        if (cached.passwordChangedAt &&
            User_1.User.isJWTIssuedBeforePasswordChanged(cached.passwordChangedAt, iat)) {
            throw new AppErros_1.default(http_status_1.default.UNAUTHORIZED, "Token revoked: password changed");
        }
        if (requiredRoles.length > 0 && !requiredRoles.includes(role)) {
            throw new AppErros_1.default(http_status_1.default.FORBIDDEN, "You are not allowed to access this route");
        }
        // Prefer the database-truth _id, fall back to the token one.
        req.user = {
            ...decoded,
            _id: tokenUserId ?? cached._id,
            role: cached.role,
            status: cached.status,
            email: cached.email,
        };
        next();
    });
};
exports.default = auth;
//# sourceMappingURL=authMiddleware.js.map
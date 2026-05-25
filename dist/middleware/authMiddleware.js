"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const catchAsync_1 = require("../utils/catchAsync");
const AppErros_1 = __importDefault(require("../error/AppErros"));
const http_status_1 = __importDefault(require("http-status"));
const VerifyJWt_1 = require("../utils/VerifyJWt");
const config_1 = __importDefault(require("../config"));
const User_1 = require("../models/User");
const auth = (...requiredRoles) => {
    return (0, catchAsync_1.catchAsync)(async (req, res, next) => {
        const authHeader = req.headers.authorization;
        // Check if Authorization header is present and starts with "Bearer "
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new AppErros_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized access");
        }
        // Extract token after "Bearer "
        const token = authHeader.split(" ")[1];
        // Check if token is present
        if (!token) {
            throw new AppErros_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized access");
        }
        const decoded = (0, VerifyJWt_1.verifyToken)(token, config_1.default.jwtSecret);
        const { role, email, iat } = decoded;
        //check if user is exist
        const user = await User_1.User.isUserExistsByEmail(email);
        if (!user) {
            throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "User not found");
        }
        //checking if the user already deleted
        const status = user?.status;
        if (status === "BLOCKED") {
            throw new AppErros_1.default(http_status_1.default.FORBIDDEN, "This user is blocked");
        }
        if (user.passwordChangedAt &&
            User_1.User.isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, iat)) {
            throw new AppErros_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized access");
        }
        if (requiredRoles && !requiredRoles.includes(role)) {
            throw new AppErros_1.default(http_status_1.default.FORBIDDEN, "You are not allowed to access this route");
        }
        req.user = decoded;
        next();
    });
};
exports.default = auth;
//# sourceMappingURL=authMiddleware.js.map
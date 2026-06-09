"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const userConstant_1 = require("../constants/userConstant");
const User_1 = require("../models/User");
const http_status_1 = __importDefault(require("http-status"));
const VerifyJWt_1 = require("../utils/VerifyJWt");
const config_1 = __importDefault(require("../config"));
const AppErros_1 = __importDefault(require("../error/AppErros"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const toRole = (r) => (r in userConstant_1.USER_ROLE ? r : userConstant_1.USER_ROLE.USER);
const toStatus = (s) => (s in userConstant_1.USER_STATUS ? s : userConstant_1.USER_STATUS.ACTIVE);
const buildJwtPayload = (user) => ({
    _id: String(user._id),
    name: user.name,
    email: user.email,
    mobileNumber: user.mobileNumber ?? "",
    role: toRole(user.role),
    status: toStatus(user.status),
    profilePhoto: user.profilePhoto ?? null,
});
const signTokens = (payload) => ({
    accessToken: (0, VerifyJWt_1.createToken)(payload, config_1.default.jwtSecret, config_1.default.jwtExpiresIn),
    refreshToken: (0, VerifyJWt_1.createToken)(payload, config_1.default.refreshSecret, config_1.default.refreshExpiresIn),
});
const stripUser = (user) => ({
    _id: String(user._id),
    name: user.name,
    email: user.email,
    mobileNumber: user.mobileNumber ?? "",
    role: user.role,
    status: user.status,
    profilePhoto: user.profilePhoto ?? null,
});
const registerUser = async (payload) => {
    // The User model already enforces unique email (lowercased) and unique mobile.
    // We double-check defensively for clearer error messages.
    const existing = await User_1.User.findOne({ email: payload.email.toLowerCase() });
    if (existing) {
        throw new AppErros_1.default(http_status_1.default.CONFLICT, "An account with this email already exists");
    }
    const newUser = await User_1.User.create({
        ...payload,
        role: userConstant_1.USER_ROLE.USER,
        email: payload.email.toLowerCase(),
    });
    const payloadJwt = buildJwtPayload(newUser);
    const tokens = signTokens(payloadJwt);
    return { ...tokens, user: stripUser(newUser) };
};
const loginUser = async (payload) => {
    const user = await User_1.User.isUserExistsByEmail(payload.email);
    if (!user) {
        throw new AppErros_1.default(http_status_1.default.UNAUTHORIZED, "Invalid credentials");
    }
    if (user.status === "BLOCKED") {
        throw new AppErros_1.default(http_status_1.default.FORBIDDEN, "This account is blocked");
    }
    if (!(await User_1.User.isPasswordMatched(payload.password, user.password))) {
        throw new AppErros_1.default(http_status_1.default.UNAUTHORIZED, "Invalid credentials");
    }
    const payloadJwt = buildJwtPayload(user);
    const tokens = signTokens(payloadJwt);
    return { ...tokens, user: stripUser(user) };
};
const changePassword = async (userData, payload) => {
    if (!userData?.email) {
        throw new AppErros_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized");
    }
    const user = await User_1.User.isUserExistsByEmail(userData.email);
    if (!user) {
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    if (user.status === "BLOCKED") {
        throw new AppErros_1.default(http_status_1.default.FORBIDDEN, "This account is blocked");
    }
    if (!(await User_1.User.isPasswordMatched(payload.oldPassword, user.password))) {
        throw new AppErros_1.default(http_status_1.default.FORBIDDEN, "Current password is incorrect");
    }
    const newHashedPassword = await bcryptjs_1.default.hash(payload.newPassword, Number(config_1.default.bcrypt_salt_rounds));
    await User_1.User.findOneAndUpdate({ email: userData.email }, {
        password: newHashedPassword,
        passwordChangedAt: new Date(),
    });
    return null;
};
const refreshToken = async (token) => {
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(token, config_1.default.refreshSecret);
    }
    catch (err) {
        const code = err.name;
        if (code === "TokenExpiredError") {
            throw new AppErros_1.default(http_status_1.default.UNAUTHORIZED, "Refresh token expired");
        }
        throw new AppErros_1.default(http_status_1.default.UNAUTHORIZED, "Invalid refresh token");
    }
    const { email } = decoded;
    if (!email) {
        throw new AppErros_1.default(http_status_1.default.UNAUTHORIZED, "Invalid token payload");
    }
    const user = await User_1.User.isUserExistsByEmail(email);
    if (!user) {
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    if (user.status === "BLOCKED") {
        throw new AppErros_1.default(http_status_1.default.FORBIDDEN, "This account is blocked");
    }
    if (user.passwordChangedAt &&
        User_1.User.isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, decoded.iat)) {
        throw new AppErros_1.default(http_status_1.default.UNAUTHORIZED, "Token revoked: password changed");
    }
    const payloadJwt = buildJwtPayload(user);
    const tokens = signTokens(payloadJwt);
    return { ...tokens, user: stripUser(user) };
};
exports.AuthService = {
    registerUser,
    loginUser,
    changePassword,
    refreshToken,
};
//# sourceMappingURL=authService.js.map
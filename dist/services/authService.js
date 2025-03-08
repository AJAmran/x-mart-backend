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
exports.AuthService = void 0;
const userConstant_1 = require("../constants/userConstant");
const User_1 = require("../models/User");
const http_status_1 = __importDefault(require("http-status"));
const VerifyJWt_1 = require("../utils/VerifyJWt");
const config_1 = __importDefault(require("../config"));
const AppErros_1 = __importDefault(require("../error/AppErros"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const registerUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // checking if the user is exist
    const user = yield User_1.User.isUserExistsByEmail(payload === null || payload === void 0 ? void 0 : payload.email);
    if (user) {
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "This user is already exist!");
    }
    payload.role = userConstant_1.USER_ROLE.USER;
    //create new user
    const newUser = yield User_1.User.create(payload);
    //create token and sent to the  client
    const jwtPayload = {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        mobileNumber: newUser.mobileNumber,
        role: newUser.role,
        status: newUser.status,
        profilePhoto: newUser.profilePhoto,
    };
    const accessToken = (0, VerifyJWt_1.createToken)(jwtPayload, config_1.default.jwtSecret, config_1.default.jwtExpiresIn);
    const refreshToken = (0, VerifyJWt_1.createToken)(jwtPayload, config_1.default.refreshSecret, config_1.default.refreshExpiresIn);
    return { accessToken, refreshToken };
});
const loginUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // check if the user is exist
    const user = yield User_1.User.isUserExistsByEmail(payload.email);
    if (!user) {
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "User not found!");
    }
    // check if the user is blocked
    if (user.status === "BLOCKED") {
        throw new AppErros_1.default(http_status_1.default.FORBIDDEN, "This user is blocked!");
    }
    // check if the password is correct
    if (!(yield User_1.User.isPasswordMatched(payload === null || payload === void 0 ? void 0 : payload.password, user === null || user === void 0 ? void 0 : user.password))) {
        throw new AppErros_1.default(http_status_1.default.UNAUTHORIZED, "Password is incorrect!");
    }
    const jwtPayload = {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
        status: user.status,
        profilePhoto: user.profilePhoto,
    };
    const accessToken = (0, VerifyJWt_1.createToken)(jwtPayload, config_1.default.jwtSecret, config_1.default.jwtExpiresIn);
    const refreshToken = (0, VerifyJWt_1.createToken)(jwtPayload, config_1.default.refreshSecret, config_1.default.refreshExpiresIn);
    return { accessToken, refreshToken };
});
const changePassword = (userData, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // checking if the user is exist
    const user = yield User_1.User.isUserExistsByEmail(userData.email);
    if (!user) {
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "This user is not found!");
    }
    // checking if the user is blocked
    const userStatus = user === null || user === void 0 ? void 0 : user.status;
    if (userStatus === "BLOCKED") {
        throw new AppErros_1.default(http_status_1.default.FORBIDDEN, "This user is blocked!");
    }
    //checking if the password is correct
    if (!(yield User_1.User.isPasswordMatched(payload.oldPassword, user === null || user === void 0 ? void 0 : user.password)))
        throw new AppErros_1.default(http_status_1.default.FORBIDDEN, "Password do not matched");
    //hash new password
    const newHashedPassword = yield bcryptjs_1.default.hash(payload.newPassword, Number(config_1.default.bcrypt_salt_rounds));
    yield User_1.User.findOneAndUpdate({
        email: userData.email,
        role: userData.role,
    }, {
        password: newHashedPassword,
        passwordChangedAt: new Date(),
    });
    return null;
});
const refreshToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const decoded = jsonwebtoken_1.default.verify(token, config_1.default.refreshSecret);
    const { email, iat } = decoded;
    // checking if the user is exist
    const user = yield User_1.User.isUserExistsByEmail(email);
    if (!user) {
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "This user is not found");
    }
    // checking if the user is blocked
    const userStatus = user === null || user === void 0 ? void 0 : user.status;
    if (userStatus === "BLOCKED") {
        throw new AppErros_1.default(http_status_1.default.FORBIDDEN, " This user is blocked");
    }
    if (user.passwordChangedAt &&
        User_1.User.isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, iat)) {
        throw new AppErros_1.default(http_status_1.default.UNAUTHORIZED, "Access Denied");
    }
    const jwtPayload = {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
        status: user.status,
    };
    const accessToken = (0, VerifyJWt_1.createToken)(jwtPayload, config_1.default.jwtSecret, config_1.default.jwtExpiresIn);
    return {
        accessToken,
    };
});
exports.AuthService = {
    registerUser,
    loginUser,
    changePassword,
    refreshToken,
};

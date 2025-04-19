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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const AppErros_1 = __importDefault(require("../error/AppErros"));
const User_1 = require("../models/User");
const http_status_1 = __importDefault(require("http-status"));
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield User_1.User.find().select("-password -passwordChangedAt");
    return result;
});
const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield User_1.User.findById(id).select("-password -passwordChangedAt");
    if (!result) {
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    return result;
});
const updateUser = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.User.findById(id);
    if (!user) {
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    // Prevent updating sensitive fields
    const { password, role, status } = payload, updateData = __rest(payload, ["password", "role", "status"]);
    const result = yield User_1.User.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    }).select("-password -passwordChangedAt");
    return result;
});
const deleteUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.User.findByIdAndDelete(id);
    if (!user) {
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    return user;
});
const updateUserStatus = (id, status) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.User.findByIdAndUpdate(id, { status }, { new: true, runValidators: true }).select("-password -passwordChangedAt");
    if (!user) {
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    return user;
});
const updateUserRole = (id, role) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.User.findByIdAndUpdate(id, { role }, { new: true, runValidators: true }).select("-password -passwordChangedAt");
    if (!user) {
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    return user;
});
exports.UserService = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    updateUserStatus,
    updateUserRole,
};

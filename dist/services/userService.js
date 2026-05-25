"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const AppErros_1 = __importDefault(require("../error/AppErros"));
const User_1 = require("../models/User");
const http_status_1 = __importDefault(require("http-status"));
const paginationHelpers_1 = require("../utils/paginationHelpers");
const getAllUsers = async (filters, options) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelpers_1.paginationHelpers.calculatePagination(options);
    const query = {};
    if (filters.search) {
        query.$or = [
            { name: { $regex: filters.search, $options: "i" } },
            { email: { $regex: filters.search, $options: "i" } },
            { mobileNumber: { $regex: filters.search, $options: "i" } },
        ];
    }
    if (filters.status) {
        query.status = filters.status.toUpperCase();
    }
    if (filters.role) {
        query.role = filters.role.toUpperCase();
    }
    const [result, total] = await Promise.all([
        User_1.User.find(query)
            .select("-password -passwordChangedAt")
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit),
        User_1.User.countDocuments(query),
    ]);
    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        data: result,
    };
};
const getUserById = async (id) => {
    const result = await User_1.User.findById(id).select("-password -passwordChangedAt");
    if (!result) {
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    return result;
};
const updateUser = async (id, payload) => {
    const user = await User_1.User.findById(id);
    if (!user) {
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    // Prevent updating sensitive fields
    const { password, role, status, ...updateData } = payload;
    const result = await User_1.User.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    }).select("-password -passwordChangedAt");
    return result;
};
const deleteUser = async (id) => {
    const user = await User_1.User.findByIdAndDelete(id);
    if (!user) {
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    return user;
};
const updateUserStatus = async (id, status) => {
    const user = await User_1.User.findByIdAndUpdate(id, { status }, { new: true, runValidators: true }).select("-password -passwordChangedAt");
    if (!user) {
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    return user;
};
const updateUserRole = async (id, role) => {
    const user = await User_1.User.findByIdAndUpdate(id, { role }, { new: true, runValidators: true }).select("-password -passwordChangedAt");
    if (!user) {
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    return user;
};
exports.UserService = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    updateUserStatus,
    updateUserRole,
};
//# sourceMappingURL=userService.js.map
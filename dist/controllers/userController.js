"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserControllers = void 0;
const userService_1 = require("../services/userService");
const catchAsync_1 = require("../utils/catchAsync");
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const pick_1 = __importDefault(require("../utils/pick"));
const getAllUsers = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const filters = (0, pick_1.default)(req.query, ["search", "status", "role"]);
    const options = (0, pick_1.default)(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const result = await userService_1.UserService.getAllUsers(filters, options);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Users retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});
const getUserById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const result = await userService_1.UserService.getUserById(id);
    // Check if the requesting user is the same as the requested user or an admin
    if (req.user.role !== "ADMIN" && req.user._id !== id) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.FORBIDDEN,
            success: false,
            message: "You are not authorized to access this resource",
            data: null,
        });
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User retrieved successfully",
        data: result,
    });
});
const updateUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const payload = req.body;
    // Check authorization
    if (req.user.role !== "ADMIN" && req.user._id !== id) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.FORBIDDEN,
            success: false,
            message: "You are not authorized to perform this action",
            data: null,
        });
    }
    const result = await userService_1.UserService.updateUser(id, payload);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User updated successfully",
        data: result,
    });
});
const deleteUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    await userService_1.UserService.deleteUser(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User deleted successfully",
        data: null,
    });
});
const updateUserStatus = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const result = await userService_1.UserService.updateUserStatus(id, status);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User status updated successfully",
        data: result,
    });
});
const updateUserRole = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    const result = await userService_1.UserService.updateUserRole(id, role);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User role updated successfully",
        data: result,
    });
});
exports.UserControllers = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    updateUserStatus,
    updateUserRole,
};
//# sourceMappingURL=userController.js.map
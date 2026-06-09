"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserControllers = void 0;
const mongoose_1 = require("mongoose");
const userService_1 = require("../services/userService");
const catchAsync_1 = require("../utils/catchAsync");
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const pick_1 = __importDefault(require("../utils/pick"));
const AppErros_1 = __importDefault(require("../error/AppErros"));
const isOwnerOrAdmin = (req, targetId) => {
    const role = req.user?.role;
    const userId = req.user?._id;
    return role === "ADMIN" || userId === targetId;
};
const validateObjectId = (id, label = "id") => {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new AppErros_1.default(http_status_1.default.BAD_REQUEST, `Invalid ${label}`);
    }
};
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
    validateObjectId(id, "user id");
    // High-priority: A01 IDOR — non-admins can only fetch themselves
    if (!isOwnerOrAdmin(req, id)) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.FORBIDDEN,
            success: false,
            message: "You are not authorized to access this resource",
            data: null,
        });
    }
    const result = await userService_1.UserService.getUserById(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User retrieved successfully",
        data: result,
    });
});
const updateUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    validateObjectId(id, "user id");
    if (!isOwnerOrAdmin(req, id)) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.FORBIDDEN,
            success: false,
            message: "You are not authorized to perform this action",
            data: null,
        });
    }
    const result = await userService_1.UserService.updateUser(id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User updated successfully",
        data: result,
    });
});
const deleteUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    validateObjectId(id, "user id");
    if (!isOwnerOrAdmin(req, id)) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.FORBIDDEN,
            success: false,
            message: "You are not authorized to perform this action",
            data: null,
        });
    }
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
    validateObjectId(id, "user id");
    if (!isOwnerOrAdmin(req, id)) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.FORBIDDEN,
            success: false,
            message: "You are not authorized to perform this action",
            data: null,
        });
    }
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
    validateObjectId(id, "user id");
    // Only admins can change roles
    if (req.user?.role !== "ADMIN") {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.FORBIDDEN,
            success: false,
            message: "Only admins can change roles",
            data: null,
        });
    }
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
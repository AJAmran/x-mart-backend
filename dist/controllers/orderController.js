"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderControllers = void 0;
const mongoose_1 = require("mongoose");
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../utils/catchAsync");
const orderService_1 = require("../services/orderService");
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
const AppErros_1 = __importDefault(require("../error/AppErros"));
const validateObjectId = (id, label = "id") => {
    if (!mongoose_1.Types.ObjectId.isValid(id)) {
        throw new AppErros_1.default(http_status_1.default.BAD_REQUEST, `Invalid ${label}`);
    }
};
const createOrder = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new AppErros_1.default(http_status_1.default.UNAUTHORIZED, "User ID not found in token");
    }
    const result = await orderService_1.OrderService.createOrder(userId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Order created successfully",
        data: result,
    });
});
const getAllOrders = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { status, userId, page = "1", limit = "10", sortBy = "createdAt", sortOrder = "desc" } = req.query;
    const filters = {};
    if (status)
        filters.status = status.toUpperCase();
    if (userId)
        filters.userId = userId;
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy: sortBy,
        sortOrder: sortOrder,
    };
    const result = await orderService_1.OrderService.getAllOrders(filters, options);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Orders fetched successfully",
        meta: result.meta,
        data: result.data,
    });
});
const getOrderById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    validateObjectId(id, "order id");
    const result = await orderService_1.OrderService.getOrderById(id);
    // High-priority: A01 IDOR — non-admins can only fetch their own orders.
    const role = req.user?.role;
    const userId = req.user?._id;
    if (role !== "ADMIN" && String(result.userId) !== userId) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.FORBIDDEN,
            success: false,
            message: "You are not authorized to view this order",
            data: null,
        });
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Order fetched successfully",
        data: result,
    });
});
const getUserOrders = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new AppErros_1.default(http_status_1.default.UNAUTHORIZED, "User ID not found in token");
    }
    const result = await orderService_1.OrderService.getUserOrders(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User orders fetched successfully",
        data: result,
    });
});
const updateOrderStatus = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    validateObjectId(id, "order id");
    const { status, note } = req.body;
    const result = await orderService_1.OrderService.updateOrderStatus(id, status, note);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Order status updated successfully",
        data: result,
    });
});
const cancelOrder = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    validateObjectId(id, "order id");
    const userId = req.user?._id;
    if (!userId) {
        throw new AppErros_1.default(http_status_1.default.UNAUTHORIZED, "User ID not found in token");
    }
    const result = await orderService_1.OrderService.cancelOrder(id, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Order cancelled successfully",
        data: result,
    });
});
exports.OrderControllers = {
    createOrder,
    getAllOrders,
    getOrderById,
    getUserOrders,
    updateOrderStatus,
    cancelOrder,
};
//# sourceMappingURL=orderController.js.map
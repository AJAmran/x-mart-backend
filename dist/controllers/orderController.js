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
exports.OrderControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../utils/catchAsync");
const orderService_1 = require("../services/orderService");
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
const AppErros_1 = __importDefault(require("../error/AppErros"));
const createOrder = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id; // Changed from req.user?.id to req.user?._id
    if (!userId) {
        throw new AppErros_1.default(http_status_1.default.UNAUTHORIZED, "User ID not found in token");
    }
    const orderData = req.body;
    const result = yield orderService_1.OrderService.createOrder(userId, orderData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Order created successfully",
        data: result,
    });
}));
const getAllOrders = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { status, userId, page = "1", limit = "10", sortBy = "createdAt", sortOrder = "desc", } = req.query;
    const filters = {};
    if (status)
        filters.status = status.toUpperCase();
    if (userId)
        filters.userId = userId;
    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder,
    };
    const result = yield orderService_1.OrderService.getAllOrders(filters, options);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Orders fetched successfully",
        meta: result.meta,
        data: result.data,
    });
}));
const getOrderById = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield orderService_1.OrderService.getOrderById(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Order fetched successfully",
        data: result,
    });
}));
const getUserOrders = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id; // Changed from req.user?.id to req.user?._id
    const result = yield orderService_1.OrderService.getUserOrders(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User orders fetched successfully",
        data: result,
    });
}));
const updateOrderStatus = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { status, note } = req.body;
    const result = yield orderService_1.OrderService.updateOrderStatus(id, status, note);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Order status updated successfully",
        data: result,
    });
}));
const cancelOrder = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id; // Changed from req.user?.id to req.user?._id
    const result = yield orderService_1.OrderService.cancelOrder(id, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Order cancelled successfully",
        data: result,
    });
}));
exports.OrderControllers = {
    createOrder,
    getAllOrders,
    getOrderById,
    getUserOrders,
    updateOrderStatus,
    cancelOrder,
};

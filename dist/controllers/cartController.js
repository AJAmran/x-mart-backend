"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartController = void 0;
const catchAsync_1 = require("../utils/catchAsync");
const cartService_1 = require("../services/cartService");
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const getCart = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { userId } = req.user;
    const cart = await cartService_1.CartService.getCartByUserId(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Cart fetched successfully",
        data: cart,
    });
});
const updateCart = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { userId } = req.user;
    const { items } = req.body;
    const cart = await cartService_1.CartService.createOrUpdateCart(userId, items);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Cart updated successfully",
        data: cart,
    });
});
const deleteCart = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { userId } = req.user;
    const cart = await cartService_1.CartService.deleteCart(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Cart deleted successfully",
        data: cart,
    });
});
exports.CartController = {
    getCart,
    updateCart,
    deleteCart,
};
//# sourceMappingURL=cartController.js.map
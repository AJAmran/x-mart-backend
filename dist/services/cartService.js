"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const AppErros_1 = __importDefault(require("../error/AppErros"));
const Cart_1 = require("../models/Cart");
const http_status_1 = __importDefault(require("http-status"));
const getCartByUserId = async (userId) => {
    return await Cart_1.Cart.findOne({ userId }).populate("items.productId");
};
const createOrUpdateCart = async (userId, items) => {
    const cart = await Cart_1.Cart.findOne({ userId });
    if (cart) {
        cart.items = items;
        cart.totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
        cart.totalPrice = items.reduce((acc, item) => acc + item.quantity * item.price, 0);
        await cart.save();
        return cart;
    }
    else {
        const newCart = await Cart_1.Cart.create({
            userId,
            items,
            totalItems: items.reduce((acc, item) => acc + item.quantity, 0),
            totalPrice: items.reduce((acc, item) => acc + item.quantity * item.price, 0),
        });
        return newCart;
    }
};
const deleteCart = async (userId) => {
    const cart = await Cart_1.Cart.findOneAndDelete({ userId });
    if (!cart) {
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "Cart not found");
    }
    return cart;
};
exports.CartService = {
    getCartByUserId,
    createOrUpdateCart,
    deleteCart,
};
//# sourceMappingURL=cartService.js.map
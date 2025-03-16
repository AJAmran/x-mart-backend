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
exports.CartService = void 0;
const AppErros_1 = __importDefault(require("../error/AppErros"));
const Cart_1 = require("../models/Cart");
const http_status_1 = __importDefault(require("http-status"));
const getCartByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield Cart_1.Cart.findOne({ userId }).populate("items.productId");
});
const createOrUpdateCart = (userId, items) => __awaiter(void 0, void 0, void 0, function* () {
    const cart = yield Cart_1.Cart.findOne({ userId });
    if (cart) {
        cart.items = items;
        cart.totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
        cart.totalPrice = items.reduce((acc, item) => acc + item.quantity * item.price, 0);
        yield cart.save();
        return cart;
    }
    else {
        const newCart = yield Cart_1.Cart.create({
            userId,
            items,
            totalItems: items.reduce((acc, item) => acc + item.quantity, 0),
            totalPrice: items.reduce((acc, item) => acc + item.quantity * item.price, 0),
        });
        return newCart;
    }
});
const deleteCart = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const cart = yield Cart_1.Cart.findOneAndDelete({ userId });
    if (!cart) {
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "Cart not found");
    }
    return cart;
});
exports.CartService = {
    getCartByUserId,
    createOrUpdateCart,
    deleteCart,
};

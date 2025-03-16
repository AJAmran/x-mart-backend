"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cart = void 0;
const mongoose_1 = require("mongoose");
const cartItemSchema = new mongoose_1.Schema({
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    name: { type: String, required: true },
    image: { type: String, required: true },
});
const cartSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", unique: true },
    items: [cartItemSchema],
    totalPrice: { type: Number, required: true, min: 0 },
    totalItems: { type: Number, required: true, min: 0 },
}, { timestamps: true });
exports.Cart = (0, mongoose_1.model)("Cart", cartSchema);

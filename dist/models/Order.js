"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = require("mongoose");
const orderInterface_1 = require("../interface/orderInterface");
const orderItemSchema = new mongoose_1.Schema({
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    name: { type: String, required: true },
    image: { type: String, required: true },
}, { _id: false });
const orderSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true, validate: (v) => v.length > 0 },
    shippingInfo: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        addressLine1: { type: String, required: true },
        addressLine2: { type: String },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        division: { type: String, required: true },
        phone: { type: String, required: true },
    },
    totalPrice: { type: Number, required: true, min: 0 },
    status: {
        type: String,
        enum: Object.keys(orderInterface_1.ORDER_STATUS),
        default: orderInterface_1.ORDER_STATUS.PENDING,
    },
    paymentMethod: {
        type: String,
        enum: ["CASH_ON_DELIVERY", "ONLINE"],
        required: true,
    },
    stockDeducted: { type: Boolean, default: false },
    idempotencyKey: { type: String, unique: true, sparse: true },
    trackingHistory: [
        {
            status: {
                type: String,
                enum: Object.keys(orderInterface_1.ORDER_STATUS),
                required: true,
            },
            updatedAt: { type: Date, default: Date.now },
            note: { type: String },
        },
    ],
}, { timestamps: true });
// Compound + single-field indexes for production query patterns
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ "items.productId": 1 });
orderSchema.index({ createdAt: -1 });
exports.Order = (0, mongoose_1.model)("Order", orderSchema);
//# sourceMappingURL=Order.js.map
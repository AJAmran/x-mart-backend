"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = require("mongoose");
const orderInterface_1 = require("../interface/orderInterface");
const orderSchema = new mongoose_1.Schema({
    userId: { type: String, required: true },
    items: [
        {
            productId: { type: String, required: true },
            quantity: { type: Number, required: true, min: 1 },
            price: { type: Number, required: true, min: 0 },
            name: { type: String, required: true },
            image: { type: String, required: true },
        },
    ],
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
// Indexes for performance
orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
exports.Order = (0, mongoose_1.model)("Order", orderSchema);

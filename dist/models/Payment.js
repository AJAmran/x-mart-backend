"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const mongoose_1 = require("mongoose");
const paymentSchema = new mongoose_1.Schema({
    orderId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Order", required: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    tranId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true, min: 0 },
    status: {
        type: String,
        enum: ["INITIATED", "SUCCESS", "FAILED", "CANCELLED"],
        default: "INITIATED",
    },
    paymentMethod: { type: String, default: "sslcommerz" },
    gatewayData: { type: mongoose_1.Schema.Types.Mixed },
}, { timestamps: true });
paymentSchema.index({ orderId: 1, status: 1 });
paymentSchema.index({ status: 1, updatedAt: -1 });
exports.Payment = (0, mongoose_1.model)("Payment", paymentSchema);
//# sourceMappingURL=Payment.js.map
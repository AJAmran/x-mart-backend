import { model, Schema } from "mongoose";
import { TPayment } from "../interface/paymentInterface";

const paymentSchema = new Schema<TPayment>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tranId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["INITIATED", "SUCCESS", "FAILED", "CANCELLED"],
      default: "INITIATED",
    },
    paymentMethod: { type: String, default: "sslcommerz" },
    gatewayData: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

paymentSchema.index({ orderId: 1, status: 1 });
paymentSchema.index({ status: 1, updatedAt: -1 });
paymentSchema.index({ userId: 1, createdAt: -1 });

export const Payment = model<TPayment>("Payment", paymentSchema);

import { model, Schema } from "mongoose";
import { TPayment } from "../interface/paymentInterface";

const paymentSchema = new Schema<TPayment>(
  {
    orderId: { type: String, required: true },
    userId: { type: String, required: true },
    tranId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
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

paymentSchema.index({ tranId: 1 });
paymentSchema.index({ orderId: 1 });

export const Payment = model<TPayment>("Payment", paymentSchema);

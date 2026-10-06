import { model, Schema } from "mongoose";
import { ORDER_STATUS, TOrder } from "../interface/orderInterface";

const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    name: { type: String, required: true },
    image: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new Schema<TOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true, validate: (v: unknown[]) => v.length > 0 },
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
    /**
     * Branch the customer asked to fulfil from, chosen at checkout.
     *
     * This was never stored: the field was absent from the model *and* from the
     * create-order zod schema, and `validateRequest` replaces `req.body` with the
     * parsed (unknown-key-stripped) result — so the branch picker on the
     * storefront silently did nothing.
     *
     * Optional by design: an order may be fulfilled centrally, and the seed data
     * predates this field.
     */
    branchId: { type: Schema.Types.ObjectId, ref: "Branch", required: false },
    status: {
      type: String,
      enum: Object.keys(ORDER_STATUS) as (keyof typeof ORDER_STATUS)[],
      default: ORDER_STATUS.PENDING,
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
          enum: Object.keys(ORDER_STATUS) as (keyof typeof ORDER_STATUS)[],
          required: true,
        },
        updatedAt: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
  },
  { timestamps: true }
);

// Compound + single-field indexes for production query patterns
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ "items.productId": 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ branchId: 1, createdAt: -1 });

export const Order = model<TOrder>("Order", orderSchema);

import { model, Schema } from "mongoose";
import { TCart } from "../interface/cartInterface";

const cartItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  name: { type: String, required: true },
  image: { type: String, required: true },
});

const cartSchema = new Schema<TCart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", unique: true },
    items: [cartItemSchema],
    totalPrice: { type: Number, required: true, min: 0 },
    totalItems: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export const Cart = model<TCart>("Cart", cartSchema);

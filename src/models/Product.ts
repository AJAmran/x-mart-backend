import mongoose, { Schema, model } from "mongoose";

type Product = {
  name: string;
  description: string;
  category: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images: string[];
  isFeatured: boolean;
};

const productSchema = new Schema<Product>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  stock: { type: Number, required: true },
  images: [{ type: String }],
  isFeatured: { type: Boolean, default: false },
}, {
  timestamps: true,
});

export default model<Product>("Product", productSchema);

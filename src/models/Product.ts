import { Schema, model } from "mongoose";
import { PRODUCT_CATEGORY, PRODUCT_STATUS } from "../constants/productConstant";
import { TProduct } from "../interface/productInterface";

const productSchema = new Schema<TProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: Object.keys(PRODUCT_CATEGORY) as (keyof typeof PRODUCT_CATEGORY)[],
      required: true,
    },
    status: {
      type: String,
      enum: Object.keys(PRODUCT_STATUS) as (keyof typeof PRODUCT_STATUS)[],
      default: "ACTIVE",
    },
    stock: { type: Number, required: true, min: 0 },
    images: { type: [String], default: [] },
    discount: {
      type: {
        type: String,
        enum: ["percentage", "fixed"],
      },
      value: { type: Number, min: 0 },
      startDate: { type: Date },
      endDate: { type: Date },
    },
  },
  { timestamps: true }
);

// Indexes for performance optimization
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ stock: 1 });

export const Product = model<TProduct>("Product", productSchema);

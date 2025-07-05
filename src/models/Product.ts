import { Schema, model } from "mongoose";
import { 
  PRODUCT_CATEGORY, 
  PRODUCT_STATUS, 
  PRODUCT_AVAILABILITY,
  PRODUCT_OPERATION_TYPES 
} from "../constants/productConstant";
import { TProduct } from "../interface/productInterface";

const inventorySchema = new Schema({
  stock: { type: Number, required: true, min: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  branchId: { type: String, required: true }
});

const discountSchema = new Schema({
  type: {
    type: String,
    enum: ["percentage", "fixed"],
    required: true
  },
  value: { type: Number, required: true, min: 0 },
  startDate: { type: Date },
  endDate: { type: Date },
  applicableBranches: { type: [String], default: [] }
});

const dimensionsSchema = new Schema({
  length: { type: Number },
  width: { type: Number },
  height: { type: Number }
});

const productSchema = new Schema<TProduct>(
  {
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0, index: true },
    costPrice: { type: Number, min: 0 },
    category: {
      type: String,
      enum: Object.keys(PRODUCT_CATEGORY) as (keyof typeof PRODUCT_CATEGORY)[],
      required: true,
      index: true
    },
    subCategory: { type: String, index: true },
    status: {
      type: String,
      enum: Object.keys(PRODUCT_STATUS) as (keyof typeof PRODUCT_STATUS)[],
      default: "ACTIVE",
      index: true
    },
    inventories: { type: [inventorySchema], required: true },
    images: { type: [String], default: [] },
    discount: discountSchema,
    availability: {
      type: String,
      enum: Object.keys(PRODUCT_AVAILABILITY) as (keyof typeof PRODUCT_AVAILABILITY)[],
      required: true,
      default: "ALL_BRANCHES"
    },
    availableBranches: { type: [String], index: true },
    operationType: {
      type: String,
      enum: Object.keys(PRODUCT_OPERATION_TYPES) as (keyof typeof PRODUCT_OPERATION_TYPES)[],
      default: "REGULAR"
    },
    tags: { type: [String], index: true },
    weight: { type: Number },
    dimensions: dimensionsSchema,
    manufacturer: { type: String },
    supplier: { type: String },
    barcode: { type: String, index: true },
    sku: { type: String, required: true, unique: true, index: true }
  },
  { timestamps: true }
);

// Compound indexes for better query performance
productSchema.index({ category: 1, subCategory: 1 });
productSchema.index({ status: 1, availability: 1 });
productSchema.index({ price: 1, operationType: 1 });
productSchema.index({ name: "text", description: "text", tags: "text" });

export const Product = model<TProduct>("Product", productSchema);
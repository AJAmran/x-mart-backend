import { z } from "zod";
import {
  PRODUCT_AVAILABILITY,
  PRODUCT_CATEGORY,
  PRODUCT_OPERATION_TYPES,
  PRODUCT_STATUS,
} from "../constants/productConstant";

// Reusable discount schema
const discountSchema = z.object({
  type: z.enum(["percentage", "fixed"], {
    required_error: "Discount type is required",
  }),
  value: z
    .number()
    .min(0, { message: "Discount value must be a positive number" }),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  applicableBranches: z.array(z.string()).optional(),
});

const inventorySchema = z.object({
  stock: z.number().min(0, { message: "Stock must be a positive number" }),
  lowStockThreshold: z.number().min(0).optional(),
  branchId: z.string().min(1, { message: "Branch ID is required" }),
});

const dimensionsSchema = z.object({
  length: z.number().min(0).optional(),
  width: z.number().min(0).optional(),
  height: z.number().min(0).optional(),
});

// Product validation schema
const baseProductSchema = {
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  price: z.number().min(0, { message: "Price must be a positive number" }),
  costPrice: z.number().min(0).optional(),
  category: z.enum(
    Object.keys(PRODUCT_CATEGORY) as [keyof typeof PRODUCT_CATEGORY],
    { required_error: "Category is required" }
  ),
  subCategory: z.string().optional(),
  status: z
    .enum(Object.keys(PRODUCT_STATUS) as [keyof typeof PRODUCT_STATUS])
    .optional(),
  stock: z.number().min(0).optional(),
  inventories: z.array(inventorySchema).min(1, { message: "At least one inventory entry is required" }),
  images: z
    .array(z.string().url({ message: "Invalid image URL" }))
    .optional(),
  discount: discountSchema.optional(),
  availability: z
    .enum(Object.keys(PRODUCT_AVAILABILITY) as [keyof typeof PRODUCT_AVAILABILITY])
    .optional(),
  availableBranches: z.array(z.string()).optional(),
  operationType: z
    .enum(Object.keys(PRODUCT_OPERATION_TYPES) as [keyof typeof PRODUCT_OPERATION_TYPES])
    .optional(),
  tags: z.array(z.string()).optional(),
  weight: z.number().min(0).optional(),
  dimensions: dimensionsSchema.optional(),
  manufacturer: z.string().optional(),
  supplier: z.string().optional(),
  barcode: z.string().optional(),
  sku: z.string().min(1, { message: "SKU is required" }),
};

const createProductValidationSchema = z.object({
  body: z.object(baseProductSchema),
});

const updateProductValidationSchema = z.object({
  body: z.object(baseProductSchema).partial(),
});

const updateStockValidationSchema = z.object({
  body: z.object({
    branchId: z.string().min(1, { message: "Branch ID is required" }),
    stock: z.number().min(0, { message: "Stock must be a positive number" }),
  }),
});

const applyDiscountValidationSchema = z.object({
  body: discountSchema,
});

export const ProductValidation = {
  createProductValidationSchema,
  updateProductValidationSchema,
  updateStockValidationSchema,
  applyDiscountValidationSchema,
};

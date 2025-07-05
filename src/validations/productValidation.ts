import { z } from "zod";
import { 
  PRODUCT_CATEGORY, 
  PRODUCT_STATUS, 
  PRODUCT_AVAILABILITY,
  PRODUCT_OPERATION_TYPES 
} from "../constants/productConstant";

// Reusable schemas
const inventorySchema = z.object({
  stock: z.number().min(0, { message: "Stock must be a positive number" }),
  lowStockThreshold: z.number().min(0).optional(),
  branchId: z.string().min(1, { message: "Branch ID is required" })
});

const discountSchema = z.object({
  type: z.enum(["percentage", "fixed"], {
    required_error: "Discount type is required",
  }),
  value: z.number().min(0, { message: "Discount value must be positive" }),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  applicableBranches: z.array(z.string()).optional()
});

const dimensionsSchema = z.object({
  length: z.number().min(0).optional(),
  width: z.number().min(0).optional(),
  height: z.number().min(0).optional()
});

// Main product validation schemas
const createProductValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, { message: "Name is required" }),
    description: z.string().min(1, { message: "Description is required" }),
    price: z.number().min(0, { message: "Price must be positive" }),
    costPrice: z.number().min(0).optional(),
    category: z.enum(
      Object.keys(PRODUCT_CATEGORY) as [keyof typeof PRODUCT_CATEGORY],
      { required_error: "Category is required" }
    ),
    subCategory: z.string().optional(),
    status: z
      .enum(Object.keys(PRODUCT_STATUS) as [keyof typeof PRODUCT_STATUS])
      .optional(),
    inventories: z.array(inventorySchema).min(1, { message: "At least one inventory entry is required" }),
    images: z.array(z.string().url({ message: "Invalid image URL" })).optional(),
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
    sku: z.string().min(1, { message: "SKU is required" })
  })
});

const updateProductValidationSchema = z.object({
  body: createProductValidationSchema.shape.body.partial()
    .refine(data => Object.keys(data).length > 0, {
      message: "At least one field must be provided",
      path: []
    })
});

const branchSpecificSchema = z.object({
  branchId: z.string().min(1, { message: "Branch ID is required" })
});

const updateStockValidationSchema = z.object({
  body: z.object({
    branchId: z.string().min(1, { message: "Branch ID is required" }),
    stock: z.number().min(0, { message: "Stock must be positive" })
  })
});

const applyDiscountValidationSchema = z.object({
  body: discountSchema.extend({
    branchIds: z.array(z.string()).optional()
  })
});

export const ProductValidation = {
  createProductValidationSchema,
  updateProductValidationSchema,
  updateStockValidationSchema,
  applyDiscountValidationSchema,
  branchSpecificSchema
};
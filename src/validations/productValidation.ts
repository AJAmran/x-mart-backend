import { z } from "zod";
import { PRODUCT_CATEGORY, PRODUCT_STATUS } from "../constants/productConstant";

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
});

// Product validation schema
const createProductValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, { message: "Name is required" }),
    description: z.string().min(1, { message: "Description is required" }),
    price: z.number().min(0, { message: "Price must be a positive number" }),
    category: z.enum(
      Object.keys(PRODUCT_CATEGORY) as [keyof typeof PRODUCT_CATEGORY],
      { required_error: "Category is required" }
    ),
    status: z
      .enum(Object.keys(PRODUCT_STATUS) as [keyof typeof PRODUCT_STATUS])
      .optional(),
    stock: z.number().min(0, { message: "Stock must be a positive number" }),
    images: z
      .array(z.string().url({ message: "Invalid image URL" }))
      .optional(),
    discount: discountSchema.optional(),
  }),
});

const updateProductValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    price: z.number().min(0).optional(),
    category: z
      .enum(Object.keys(PRODUCT_CATEGORY) as [keyof typeof PRODUCT_CATEGORY])
      .optional(),
    status: z
      .enum(Object.keys(PRODUCT_STATUS) as [keyof typeof PRODUCT_STATUS])
      .optional(),
    stock: z.number().min(0).optional(),
    images: z
      .array(z.string().url({ message: "Invalid image URL" }))
      .optional(),
    discount: discountSchema.optional(),
  }),
});

const updateStockValidationSchema = z.object({
  body: z.object({
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

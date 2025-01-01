import { z } from "zod";

// Validation for creating a product
export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Product name is required"),
    price: z.number().min(0, "Price must be a positive number"),
    category: z.string().min(1, "Category is required"),
    stock: z.number().int().min(0, "Stock must be a positive integer"),
    description: z.string().optional(),
    brand: z.string().optional(),
    tags: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
  }),
});

// Validation for updating a product
export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid product ID"), // Ensures valid MongoDB ObjectId
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    price: z.number().min(0).optional(),
    category: z.string().min(1).optional(),
    stock: z.number().int().min(0).optional(),
    description: z.string().optional(),
    brand: z.string().optional(),
    tags: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
  }),
});

// Validation for bulk delete
export const bulkDeleteProductsSchema = z.object({
  body: z.object({
    ids: z.array(z.string().regex(/^[a-f\d]{24}$/i, "Invalid product ID")).min(1, "At least one ID is required"),
  }),
});

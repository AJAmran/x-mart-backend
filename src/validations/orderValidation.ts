import { z } from "zod";

// Validation for creating an order
export const createOrderSchema = z.object({
  body: z.object({
    user: z.string().regex(/^[a-f\d]{24}$/i, "Invalid user ID"),
    products: z
      .array(
        z.object({
          product: z.string().regex(/^[a-f\d]{24}$/i, "Invalid product ID"),
          quantity: z.number().min(1, "Quantity must be at least 1"),
          price: z.number().min(0, "Price must be positive"),
        })
      )
      .min(1, "At least one product is required"),
    paymentDetails: z.object({
      method: z.enum(["Card", "Cash", "Bank"]),
      transactionId: z.string().optional(),
    }),
    shippingAddress: z.object({
      address: z.string().min(1, "Address is required"),
      city: z.string().min(1, "City is required"),
      postalCode: z.string().min(1, "Postal Code is required"),
      country: z.string().min(1, "Country is required"),
    }),
  }),
});

// Validation for updating order status
export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid order ID"),
  }),
  body: z.object({
    status: z.enum([
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ]),
  }),
});

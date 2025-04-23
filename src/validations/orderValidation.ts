import { z } from "zod";
import { ORDER_STATUS } from "../interface/orderInterface";

const orderItemSchema = z.object({
  productId: z.string().min(1, { message: "Product ID is required" }),
  quantity: z.number().min(1, { message: "Quantity must be at least 1" }),
  price: z.number().min(0, { message: "Price must be a positive number" }),
  name: z.string().min(1, { message: "Product name is required" }),
  image: z.string().url({ message: "Invalid image URL" }),
});

const shippingInfoSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  addressLine1: z.string().min(1, { message: "Address Line 1 is required" }),
  addressLine2: z.string().optional(),
  city: z.string().min(1, { message: "City is required" }),
  postalCode: z
    .string()
    .regex(/^\d{4}$/, { message: "Postal Code must be 4 digits" }),
  division: z.string().min(1, { message: "Division is required" }),
  phone: z
    .string()
    .regex(/^01\d{9}$/, { message: "Phone number must be 11 digits starting with 01" }),
});

const createOrderValidationSchema = z.object({
  body: z.object({
    items: z.array(orderItemSchema, {
      required_error: "At least one item is required",
    }),
    shippingInfo: shippingInfoSchema,
    paymentMethod: z.enum(["CASH_ON_DELIVERY", "ONLINE"], {
      required_error: "Payment method is required",
    }),
  }),
});

const updateOrderStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(Object.keys(ORDER_STATUS) as [keyof typeof ORDER_STATUS], {
      required_error: "Status is required",
    }),
    note: z.string().optional(),
  }),
});

export const OrderValidation = {
  createOrderValidationSchema,
  updateOrderStatusValidationSchema,
};
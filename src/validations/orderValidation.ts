import { z } from "zod";
import { ORDER_STATUS } from "../interface/orderInterface";

const orderItemSchema = z.object({
  productId: z.string().min(1, { message: "Product ID is required" }),
  quantity: z.number().min(1, { message: "Quantity must be at least 1" }),
  price: z.number().min(0, { message: "Price must be a positive number" }),
  name: z.string().min(1, { message: "Product name is required" }),
  image: z.string().url({ message: "Invalid image URL" }),
});

/**
 * Bangladeshi mobile numbers.
 *
 * The canonical stored form is `01XXXXXXXXX`, but clients legitimately send
 * `+8801XXXXXXXXX` (the international form, which is also how user accounts
 * store `mobileNumber`) and `8801XXXXXXXXX`. Accepting only the canonical form
 * meant a checkout field pre-filled from the account profile passed the
 * client-side check and was then rejected here with a 400.
 *
 * Anything accepted is normalised to `01XXXXXXXXX` before it reaches the
 * database, so stored values stay consistent.
 */
const normaliseBdPhone = (value: string): string | null => {
  const compact = value.replace(/[\s\-()]/g, "");
  const match = /^(?:\+?8801|01)(\d{9})$/.exec(compact);

  if (!match) return null;

  return `01${match[1]}`;
};

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
    .transform((value, ctx) => {
      const normalised = normaliseBdPhone(value);

      if (!normalised) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Phone number must be a valid Bangladeshi number (e.g. 01712345678)",
        });

        return z.NEVER;
      }

      return normalised;
    }),
});

const createOrderValidationSchema = z.object({
  body: z.object({
    items: z
      .array(orderItemSchema, {
        required_error: "At least one item is required",
      })
      .min(1, { message: "Your cart is empty. Add at least one item before placing an order" }),
    shippingInfo: shippingInfoSchema,
    paymentMethod: z.enum(["CASH_ON_DELIVERY", "ONLINE"], {
      required_error: "Payment method is required",
    }),
    /**
     * Fulfillment branch picked on the storefront.
     *
     * Without this key in the schema, zod stripped it and `validateRequest`
     * wrote back the stripped body — the branch selector silently had no effect.
     * Validated as a 24-hex ObjectId so a bad value fails loudly at the edge
     * instead of being cast to null deeper in.
     */
    branchId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid branch id" })
      .optional(),
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

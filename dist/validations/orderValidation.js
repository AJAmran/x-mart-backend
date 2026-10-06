"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderValidation = void 0;
const zod_1 = require("zod");
const orderInterface_1 = require("../interface/orderInterface");
const orderItemSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1, { message: "Product ID is required" }),
    quantity: zod_1.z.number().min(1, { message: "Quantity must be at least 1" }),
    price: zod_1.z.number().min(0, { message: "Price must be a positive number" }),
    name: zod_1.z.string().min(1, { message: "Product name is required" }),
    image: zod_1.z.string().url({ message: "Invalid image URL" }),
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
const normaliseBdPhone = (value) => {
    const compact = value.replace(/[\s\-()]/g, "");
    const match = /^(?:\+?8801|01)(\d{9})$/.exec(compact);
    if (!match)
        return null;
    return `01${match[1]}`;
};
const shippingInfoSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, { message: "Name is required" }),
    email: zod_1.z.string().email({ message: "Invalid email address" }),
    addressLine1: zod_1.z.string().min(1, { message: "Address Line 1 is required" }),
    addressLine2: zod_1.z.string().optional(),
    city: zod_1.z.string().min(1, { message: "City is required" }),
    postalCode: zod_1.z
        .string()
        .regex(/^\d{4}$/, { message: "Postal Code must be 4 digits" }),
    division: zod_1.z.string().min(1, { message: "Division is required" }),
    phone: zod_1.z
        .string()
        .transform((value, ctx) => {
        const normalised = normaliseBdPhone(value);
        if (!normalised) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "Phone number must be a valid Bangladeshi number (e.g. 01712345678)",
            });
            return zod_1.z.NEVER;
        }
        return normalised;
    }),
});
const createOrderValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        items: zod_1.z
            .array(orderItemSchema, {
            required_error: "At least one item is required",
        })
            .min(1, { message: "Your cart is empty. Add at least one item before placing an order" }),
        shippingInfo: shippingInfoSchema,
        paymentMethod: zod_1.z.enum(["CASH_ON_DELIVERY", "ONLINE"], {
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
        branchId: zod_1.z
            .string()
            .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid branch id" })
            .optional(),
    }),
});
const updateOrderStatusValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(Object.keys(orderInterface_1.ORDER_STATUS), {
            required_error: "Status is required",
        }),
        note: zod_1.z.string().optional(),
    }),
});
exports.OrderValidation = {
    createOrderValidationSchema,
    updateOrderStatusValidationSchema,
};
//# sourceMappingURL=orderValidation.js.map
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
        .regex(/^01\d{9}$/, { message: "Phone number must be 11 digits starting with 01" }),
});
const createOrderValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        items: zod_1.z.array(orderItemSchema, {
            required_error: "At least one item is required",
        }),
        shippingInfo: shippingInfoSchema,
        paymentMethod: zod_1.z.enum(["CASH_ON_DELIVERY", "ONLINE"], {
            required_error: "Payment method is required",
        }),
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

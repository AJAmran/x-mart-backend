"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductValidation = void 0;
const zod_1 = require("zod");
const productConstant_1 = require("../constants/productConstant");
// Reusable discount schema
const discountSchema = zod_1.z.object({
    type: zod_1.z.enum(["percentage", "fixed"], {
        required_error: "Discount type is required",
    }),
    value: zod_1.z
        .number()
        .min(0, { message: "Discount value must be a positive number" }),
    startDate: zod_1.z.coerce.date().optional(),
    endDate: zod_1.z.coerce.date().optional(),
});
// Product validation schema
const createProductValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, { message: "Name is required" }),
        description: zod_1.z.string().min(1, { message: "Description is required" }),
        price: zod_1.z.number().min(0, { message: "Price must be a positive number" }),
        category: zod_1.z.enum(Object.keys(productConstant_1.PRODUCT_CATEGORY), { required_error: "Category is required" }),
        status: zod_1.z
            .enum(Object.keys(productConstant_1.PRODUCT_STATUS))
            .optional(),
        stock: zod_1.z.number().min(0, { message: "Stock must be a positive number" }),
        images: zod_1.z
            .array(zod_1.z.string().url({ message: "Invalid image URL" }))
            .optional(),
        discount: discountSchema.optional(),
    }),
});
const updateProductValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).optional(),
        description: zod_1.z.string().min(1).optional(),
        price: zod_1.z.number().min(0).optional(),
        category: zod_1.z
            .enum(Object.keys(productConstant_1.PRODUCT_CATEGORY))
            .optional(),
        status: zod_1.z
            .enum(Object.keys(productConstant_1.PRODUCT_STATUS))
            .optional(),
        stock: zod_1.z.number().min(0).optional(),
        images: zod_1.z
            .array(zod_1.z.string().url({ message: "Invalid image URL" }))
            .optional(),
        discount: discountSchema.optional(),
    }),
});
const updateStockValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        stock: zod_1.z.number().min(0, { message: "Stock must be a positive number" }),
    }),
});
const applyDiscountValidationSchema = zod_1.z.object({
    body: discountSchema,
});
exports.ProductValidation = {
    createProductValidationSchema,
    updateProductValidationSchema,
    updateStockValidationSchema,
    applyDiscountValidationSchema,
};

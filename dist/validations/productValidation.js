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
    applicableBranches: zod_1.z.array(zod_1.z.string()).optional(),
});
const inventorySchema = zod_1.z.object({
    stock: zod_1.z.number().min(0, { message: "Stock must be a positive number" }),
    lowStockThreshold: zod_1.z.number().min(0).optional(),
    branchId: zod_1.z.string().min(1, { message: "Branch ID is required" }),
});
const dimensionsSchema = zod_1.z.object({
    length: zod_1.z.number().min(0).optional(),
    width: zod_1.z.number().min(0).optional(),
    height: zod_1.z.number().min(0).optional(),
});
// Product validation schema
const baseProductSchema = {
    name: zod_1.z.string().min(1, { message: "Name is required" }),
    description: zod_1.z.string().min(1, { message: "Description is required" }),
    price: zod_1.z.number().min(0, { message: "Price must be a positive number" }),
    costPrice: zod_1.z.number().min(0).optional(),
    category: zod_1.z.enum(Object.keys(productConstant_1.PRODUCT_CATEGORY), { required_error: "Category is required" }),
    subCategory: zod_1.z.string().optional(),
    status: zod_1.z
        .enum(Object.keys(productConstant_1.PRODUCT_STATUS))
        .optional(),
    stock: zod_1.z.number().min(0).optional(),
    inventories: zod_1.z.array(inventorySchema).min(1, { message: "At least one inventory entry is required" }),
    images: zod_1.z
        .array(zod_1.z.string().url({ message: "Invalid image URL" }))
        .optional(),
    discount: discountSchema.optional(),
    availability: zod_1.z
        .enum(Object.keys(productConstant_1.PRODUCT_AVAILABILITY))
        .optional(),
    availableBranches: zod_1.z.array(zod_1.z.string()).optional(),
    operationType: zod_1.z
        .enum(Object.keys(productConstant_1.PRODUCT_OPERATION_TYPES))
        .optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    weight: zod_1.z.number().min(0).optional(),
    dimensions: dimensionsSchema.optional(),
    manufacturer: zod_1.z.string().optional(),
    supplier: zod_1.z.string().optional(),
    barcode: zod_1.z.string().optional(),
    sku: zod_1.z.string().min(1, { message: "SKU is required" }),
};
const createProductValidationSchema = zod_1.z.object({
    body: zod_1.z.object(baseProductSchema),
});
const updateProductValidationSchema = zod_1.z.object({
    body: zod_1.z.object(baseProductSchema).partial(),
});
const updateStockValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        branchId: zod_1.z.string().min(1, { message: "Branch ID is required" }),
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
//# sourceMappingURL=productValidation.js.map
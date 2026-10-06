"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = require("mongoose");
const productConstant_1 = require("../constants/productConstant");
const inventorySchema = new mongoose_1.Schema({
    stock: { type: Number, required: true, min: 0 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    branchId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Branch", required: true },
}, { _id: false });
const productSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, min: 0 },
    category: {
        type: String,
        enum: Object.keys(productConstant_1.PRODUCT_CATEGORY),
        required: true,
    },
    subCategory: { type: String },
    status: {
        type: String,
        enum: Object.keys(productConstant_1.PRODUCT_STATUS),
        default: "ACTIVE",
    },
    stock: { type: Number, min: 0, default: 0 },
    inventories: { type: [inventorySchema], required: true, default: [] },
    images: { type: [String], default: [] },
    discount: {
        type: {
            type: String,
            enum: ["percentage", "fixed"],
        },
        value: { type: Number, min: 0 },
        startDate: { type: Date },
        endDate: { type: Date },
        applicableBranches: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Branch" }],
    },
    availability: {
        type: String,
        enum: Object.keys(productConstant_1.PRODUCT_AVAILABILITY),
        required: true,
        default: "ALL_BRANCHES",
    },
    availableBranches: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Branch" }],
    operationType: {
        type: String,
        enum: Object.keys(productConstant_1.PRODUCT_OPERATION_TYPES),
        required: true,
        default: "REGULAR",
    },
    tags: { type: [String], default: [] },
    weight: { type: Number, min: 0 },
    dimensions: {
        length: { type: Number, min: 0 },
        width: { type: Number, min: 0 },
        height: { type: Number, min: 0 },
    },
    manufacturer: { type: String },
    supplier: { type: String },
    barcode: { type: String },
    sku: { type: String, required: true, unique: true },
}, { timestamps: true });
// ── Indexes ────────────────────────────────────────────────────────────────
// Full-text search replaces the previous unanchored $regex (ReDoS + COLLSCAN).
productSchema.index({ name: "text", description: "text", tags: "text" });
// Catalog browse patterns
productSchema.index({ category: 1, price: 1 });
productSchema.index({ category: 1, createdAt: -1 });
productSchema.index({ status: 1, createdAt: -1 });
productSchema.index({ price: 1 });
// `sku` already declares `unique: true`, which creates the index. Repeating it
// here triggered Mongoose's "Duplicate schema index" warning.
// "Featured deals" filter — powers ?discount=true in the repository
productSchema.index({ "discount.endDate": 1, "discount.value": -1 });
productSchema.index({ "inventories.branchId": 1 });
productSchema.index({ tags: 1 });
exports.Product = (0, mongoose_1.model)("Product", productSchema);
//# sourceMappingURL=Product.js.map
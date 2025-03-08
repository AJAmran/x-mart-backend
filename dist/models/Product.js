"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = require("mongoose");
const productConstant_1 = require("../constants/productConstant");
const productSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: {
        type: String,
        enum: Object.keys(productConstant_1.PRODUCT_CATEGORY),
        required: true,
    },
    status: {
        type: String,
        enum: Object.keys(productConstant_1.PRODUCT_STATUS),
        default: "ACTIVE",
    },
    stock: { type: Number, required: true, min: 0 },
    images: { type: [String], default: [] },
    discount: {
        type: {
            type: String,
            enum: ["percentage", "fixed"],
        },
        value: { type: Number, min: 0 },
        startDate: { type: Date },
        endDate: { type: Date },
    },
}, { timestamps: true });
// Indexes for performance optimization
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ stock: 1 });
exports.Product = (0, mongoose_1.model)("Product", productSchema);

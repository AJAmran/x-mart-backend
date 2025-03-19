"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const Product_1 = require("../models/Product");
const AppErros_1 = __importDefault(require("../error/AppErros"));
const createProduct = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Product_1.Product.create(payload);
    return result;
});
const getAllProducts = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, sortBy, sortOrder } = options;
    // Calculate skip for pagination
    const skip = (page - 1) * limit;
    // Build sort criteria
    const sortCriteria = {
        [sortBy]: sortOrder === "desc" ? -1 : 1,
    };
    // Fetch products with filters, sorting, and pagination
    const result = yield Product_1.Product.find(filters)
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit);
    // Count total documents for pagination metadata
    const total = yield Product_1.Product.countDocuments(filters);
    // Calculate total pages
    const totalPages = Math.ceil(total / limit);
    return {
        meta: {
            page,
            limit,
            total,
            totalPages,
        },
        data: result,
    };
});
const getProductById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Product_1.Product.findById(id);
    if (!result) {
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "Product not found");
    }
    return result;
});
const updateProduct = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Product_1.Product.findByIdAndUpdate(id, payload, { new: true });
    if (!result) {
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "Product not found");
    }
    return result;
});
const deleteProduct = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Product_1.Product.findByIdAndDelete(id);
    if (!result) {
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "Product not found");
    }
    return result;
});
const updateStock = (id, stock) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Product_1.Product.findByIdAndUpdate(id, { stock }, { new: true });
    if (!result) {
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "Product not found");
    }
    return result;
});
const applyDiscount = (id, discount) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Product_1.Product.findByIdAndUpdate(id, { discount }, { new: true });
    if (!result) {
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "Product not found");
    }
    return result;
});
const removeDiscount = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Product_1.Product.findByIdAndUpdate(id, { $unset: { discount: 1 } }, { new: true });
    if (!result) {
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "Product not found");
    }
    return result;
});
exports.ProductService = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    updateStock,
    applyDiscount,
    removeDiscount,
};

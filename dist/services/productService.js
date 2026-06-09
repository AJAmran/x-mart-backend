"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const product_repository_1 = require("../repositories/product.repository");
const AppErros_1 = __importDefault(require("../error/AppErros"));
const createProduct = async (payload) => {
    return product_repository_1.productRepository.create(payload);
};
const getAllProducts = async (filters, options) => {
    const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = options;
    return product_repository_1.productRepository.findAll(filters, { page, limit, sortBy, sortOrder });
};
const getProductById = async (id) => {
    const result = await product_repository_1.productRepository.findById(id);
    if (!result) {
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "Product not found");
    }
    return result;
};
const updateProduct = async (id, payload) => {
    const result = await product_repository_1.productRepository.update(id, payload);
    if (!result) {
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "Product not found");
    }
    return result;
};
const deleteProduct = async (id) => {
    const result = await product_repository_1.productRepository.delete(id);
    if (!result) {
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "Product not found");
    }
    return result;
};
const updateStock = async (id, branchId, stock) => {
    const result = await product_repository_1.productRepository.updateStock(id, branchId, stock);
    if (!result) {
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "Product not found");
    }
    return result;
};
const applyDiscount = async (id, discount) => {
    const result = await product_repository_1.productRepository.applyDiscount(id, discount);
    if (!result) {
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "Product not found");
    }
    return result;
};
const removeDiscount = async (id) => {
    const result = await product_repository_1.productRepository.removeDiscount(id);
    if (!result) {
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "Product not found");
    }
    return result;
};
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
//# sourceMappingURL=productService.js.map
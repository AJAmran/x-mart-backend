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
exports.ProductControllers = void 0;
const catchAsync_1 = require("../utils/catchAsync");
const productService_1 = require("../services/productService");
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const createProduct = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productData = req.body;
    const result = yield productService_1.ProductService.createProduct(productData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Product created successfully",
        data: result,
    });
}));
const getAllProducts = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Extract query parameters
    const { searchTerm, category, minPrice, maxPrice, minStock, maxStock, status, sortBy, sortOrder, page, limit, } = req.query;
    // Build filters object
    const filters = {};
    if (searchTerm) {
        filters.name = { $regex: searchTerm, $options: "i" }; // Case-insensitive search
    }
    if (category) {
        filters.category = category.toUpperCase(); // Convert to uppercase
    }
    if (minPrice || maxPrice) {
        filters.price = {};
        if (minPrice)
            filters.price.$gte = parseFloat(minPrice);
        if (maxPrice)
            filters.price.$lte = parseFloat(maxPrice);
    }
    if (minStock || maxStock) {
        filters.stock = {};
        if (minStock)
            filters.stock.$gte = parseInt(minStock);
        if (maxStock)
            filters.stock.$lte = parseInt(maxStock);
    }
    if (status) {
        filters.status = status.toUpperCase(); // Convert to uppercase
    }
    // Build options object
    const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        sortBy: sortBy || "createdAt",
        sortOrder: sortOrder || "desc",
    };
    // Fetch products
    const result = yield productService_1.ProductService.getAllProducts(filters, options);
    // Send response
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Products fetched successfully",
        meta: result.meta,
        data: result.data,
    });
}));
const getProductById = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield productService_1.ProductService.getProductById(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Product fetched successfully",
        data: result,
    });
}));
const updateProduct = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const payload = req.body;
    const result = yield productService_1.ProductService.updateProduct(id, payload);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Product updated successfully",
        data: result,
    });
}));
const deleteProduct = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield productService_1.ProductService.deleteProduct(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Product deleted successfully",
        data: result,
    });
}));
const updateStock = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { stock } = req.body;
    const result = yield productService_1.ProductService.updateStock(id, stock);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Stock updated successfully",
        data: result,
    });
}));
const applyDiscount = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { discount } = req.body;
    const result = yield productService_1.ProductService.applyDiscount(id, discount);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Discount applied successfully",
        data: result,
    });
}));
const removeDiscount = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield productService_1.ProductService.removeDiscount(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Discount removed successfully",
        data: result,
    });
}));
exports.ProductControllers = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    updateStock,
    applyDiscount,
    removeDiscount,
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRepository = exports.ProductRepository = void 0;
const Product_1 = require("../models/Product");
class ProductRepository {
    async findAll(filters, options) {
        const { page, limit, sortBy, sortOrder } = options;
        const query = {};
        if (filters.searchTerm) {
            query.name = { $regex: filters.searchTerm, $options: "i" };
        }
        if (filters.category) {
            query.category = filters.category.toUpperCase();
        }
        if (filters.status) {
            query.status = filters.status.toUpperCase();
        }
        if (filters.minPrice || filters.maxPrice) {
            query.price = {};
            if (filters.minPrice)
                query.price.$gte = filters.minPrice;
            if (filters.maxPrice)
                query.price.$lte = filters.maxPrice;
        }
        if (filters.minStock || filters.maxStock) {
            query.stock = {};
            if (filters.minStock)
                query.stock.$gte = filters.minStock;
            if (filters.maxStock)
                query.stock.$lte = filters.maxStock;
        }
        const [data, total] = await Promise.all([
            Product_1.Product.find(query)
                .sort({ [sortBy]: sortOrder })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Product_1.Product.countDocuments(query),
        ]);
        return {
            data,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async findById(id) {
        return Product_1.Product.findById(id).lean();
    }
    async create(data) {
        const doc = await Product_1.Product.create(data);
        return doc.toObject();
    }
    async update(id, data) {
        return Product_1.Product.findByIdAndUpdate(id, data, { new: true }).lean();
    }
    async delete(id) {
        return Product_1.Product.findByIdAndDelete(id).lean();
    }
    async updateStock(id, stock) {
        return Product_1.Product.findByIdAndUpdate(id, { stock }, { new: true }).lean();
    }
    async applyDiscount(id, discount) {
        return Product_1.Product.findByIdAndUpdate(id, { discount }, { new: true }).lean();
    }
    async removeDiscount(id) {
        return Product_1.Product.findByIdAndUpdate(id, { $unset: { discount: 1 } }, { new: true }).lean();
    }
}
exports.ProductRepository = ProductRepository;
exports.productRepository = new ProductRepository();
//# sourceMappingURL=product.repository.js.map
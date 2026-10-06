"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRepository = exports.ProductRepository = void 0;
const Product_1 = require("../models/Product");
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
class ProductRepository {
    async findAll(filters, options) {
        const { page, limit, sortBy, sortOrder } = options;
        const query = {};
        // High-priority: text search replaces unindexed $regex. Escape the term
        // for the safe path; rely on the "text" index for relevance scoring.
        if (filters.searchTerm && filters.searchTerm.trim()) {
            const term = filters.searchTerm.trim();
            // Combine full-text search with a safe prefix match on the name for
            // sub-word matches (text index only matches whole tokens).
            query.$or = [
                { $text: { $search: term } },
                { name: { $regex: `^${escapeRegex(term)}`, $options: "i" } },
            ];
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
        if (filters.hasDiscount) {
            query["discount.endDate"] = { $exists: true, $gte: new Date() };
            query["discount.value"] = { $gt: 0 };
        }
        if (filters.tags?.length) {
            query.tags = { $in: filters.tags };
        }
        if (filters.branchId) {
            query["inventories.branchId"] = filters.branchId;
        }
        if (filters.minStock || filters.maxStock) {
            const stockMatch = {};
            if (filters.minStock)
                stockMatch.$gte = filters.minStock;
            if (filters.maxStock)
                stockMatch.$lte = filters.maxStock;
            query.$and = [
                ...(Array.isArray(query.$and) ? query.$and : []),
                { $or: [{ "inventories.stock": stockMatch }, { stock: stockMatch }] },
            ];
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
    async findFeatured(limit = 8) {
        return Product_1.Product.find({
            "discount.endDate": { $exists: true, $gte: new Date() },
            "discount.value": { $gt: 0 },
        })
            .sort({ "discount.value": -1, createdAt: -1 })
            .limit(limit)
            .lean();
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
    async updateStock(id, branchId, stock) {
        // Requires `inventories.branchId` to be stored as ObjectId — run
        // `npm run migrate:branch-refs` after re-seeding, otherwise Mongoose casts
        // the id and the update matches nothing (404).
        return Product_1.Product.findOneAndUpdate({ _id: id, "inventories.branchId": branchId }, { $set: { "inventories.$.stock": stock } }, { new: true }).lean();
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
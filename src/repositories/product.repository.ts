import { FilterQuery, SortOrder } from "mongoose";
import { Product } from "../models/Product";
import { TProduct } from "../interface/productInterface";

export interface ProductFilters {
  searchTerm?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  maxStock?: number;
  status?: string;
  hasDiscount?: boolean;
  branchId?: string;
  tags?: string[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const escapeRegex = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export class ProductRepository {
  async findAll(
    filters: ProductFilters,
    options: { page: number; limit: number; sortBy: string; sortOrder: SortOrder }
  ): Promise<{ data: TProduct[]; meta: PaginationMeta }> {
    const { page, limit, sortBy, sortOrder } = options;
    const query: FilterQuery<TProduct> = {};

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
      if (filters.minPrice) query.price.$gte = filters.minPrice;
      if (filters.maxPrice) query.price.$lte = filters.maxPrice;
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
      const stockMatch: Record<string, number> = {};
      if (filters.minStock) stockMatch.$gte = filters.minStock;
      if (filters.maxStock) stockMatch.$lte = filters.maxStock;
      query.$and = [
        ...(Array.isArray(query.$and) ? query.$and : []),
        { $or: [{ "inventories.stock": stockMatch }, { stock: stockMatch }] },
      ];
    }

    const [data, total] = await Promise.all([
      Product.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string): Promise<TProduct | null> {
    return Product.findById(id).lean();
  }

  async findFeatured(limit = 8): Promise<TProduct[]> {
    return Product.find({
      "discount.endDate": { $exists: true, $gte: new Date() },
      "discount.value": { $gt: 0 },
    })
      .sort({ "discount.value": -1, createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async create(data: Partial<TProduct>): Promise<TProduct> {
    const doc = await Product.create(data);
    return doc.toObject();
  }

  async update(id: string, data: Partial<TProduct>): Promise<TProduct | null> {
    return Product.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async delete(id: string): Promise<TProduct | null> {
    return Product.findByIdAndDelete(id).lean();
  }

async updateStock(id: string, branchId: string, stock: number): Promise<TProduct | null> {
      // Requires `inventories.branchId` to be stored as ObjectId — run
      // `npm run migrate:branch-refs` after re-seeding, otherwise Mongoose casts
      // the id and the update matches nothing (404).
      return Product.findOneAndUpdate(
        { _id: id, "inventories.branchId": branchId },
        { $set: { "inventories.$.stock": stock } },
        { new: true }
      ).lean();
    }

  async applyDiscount(id: string, discount: unknown): Promise<TProduct | null> {
    return Product.findByIdAndUpdate(id, { discount }, { new: true }).lean();
  }

  async removeDiscount(id: string): Promise<TProduct | null> {
    return Product.findByIdAndUpdate(id, { $unset: { discount: 1 } }, { new: true }).lean();
  }
}

export const productRepository = new ProductRepository();

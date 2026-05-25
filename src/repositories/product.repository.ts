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
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class ProductRepository {
  async findAll(
    filters: ProductFilters,
    options: { page: number; limit: number; sortBy: string; sortOrder: SortOrder }
  ): Promise<{ data: TProduct[]; meta: PaginationMeta }> {
    const { page, limit, sortBy, sortOrder } = options;
    const query: FilterQuery<TProduct> = {};

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
      if (filters.minPrice) query.price.$gte = filters.minPrice;
      if (filters.maxPrice) query.price.$lte = filters.maxPrice;
    }
    if (filters.minStock || filters.maxStock) {
      query.stock = {};
      if (filters.minStock) query.stock.$gte = filters.minStock;
      if (filters.maxStock) query.stock.$lte = filters.maxStock;
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

  async updateStock(id: string, stock: number): Promise<TProduct | null> {
    return Product.findByIdAndUpdate(id, { stock }, { new: true }).lean();
  }

  async applyDiscount(id: string, discount: any): Promise<TProduct | null> {
    return Product.findByIdAndUpdate(id, { discount }, { new: true }).lean();
  }

  async removeDiscount(id: string): Promise<TProduct | null> {
    return Product.findByIdAndUpdate(id, { $unset: { discount: 1 } }, { new: true }).lean();
  }
}

export const productRepository = new ProductRepository();

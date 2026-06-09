import { SortOrder } from "mongoose";
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
export declare class ProductRepository {
    findAll(filters: ProductFilters, options: {
        page: number;
        limit: number;
        sortBy: string;
        sortOrder: SortOrder;
    }): Promise<{
        data: TProduct[];
        meta: PaginationMeta;
    }>;
    findById(id: string): Promise<TProduct | null>;
    findFeatured(limit?: number): Promise<TProduct[]>;
    create(data: Partial<TProduct>): Promise<TProduct>;
    update(id: string, data: Partial<TProduct>): Promise<TProduct | null>;
    delete(id: string): Promise<TProduct | null>;
    updateStock(id: string, branchId: string, stock: number): Promise<TProduct | null>;
    applyDiscount(id: string, discount: unknown): Promise<TProduct | null>;
    removeDiscount(id: string): Promise<TProduct | null>;
}
export declare const productRepository: ProductRepository;

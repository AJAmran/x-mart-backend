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
    create(data: Partial<TProduct>): Promise<TProduct>;
    update(id: string, data: Partial<TProduct>): Promise<TProduct | null>;
    delete(id: string): Promise<TProduct | null>;
    updateStock(id: string, stock: number): Promise<TProduct | null>;
    applyDiscount(id: string, discount: any): Promise<TProduct | null>;
    removeDiscount(id: string): Promise<TProduct | null>;
}
export declare const productRepository: ProductRepository;

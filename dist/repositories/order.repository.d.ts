import { SortOrder } from "mongoose";
import { TOrder } from "../interface/orderInterface";
export interface OrderFilters {
    status?: string;
    userId?: string;
}
export declare class OrderRepository {
    findAll(filters: OrderFilters, options: {
        page: number;
        limit: number;
        sortBy: string;
        sortOrder: SortOrder;
    }): Promise<{
        data: TOrder[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findById(id: string): Promise<TOrder | null>;
    findByUserId(userId: string): Promise<TOrder[]>;
    create(data: Partial<TOrder>): Promise<TOrder>;
    updateStatus(id: string, status: string, trackingEntry: any): Promise<TOrder | null>;
}
export declare const orderRepository: OrderRepository;

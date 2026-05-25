import { SortOrder } from "mongoose";
import { TUser } from "../interface/userInterface";
export interface UserFilters {
    search?: string;
    status?: string;
    role?: string;
}
export declare class UserRepository {
    findAll(filters: UserFilters, options: {
        page: number;
        limit: number;
        sortBy: string;
        sortOrder: SortOrder;
    }): Promise<{
        data: TUser[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findById(id: string): Promise<TUser | null>;
    findByEmail(email: string): Promise<TUser | null>;
    create(data: Partial<TUser>): Promise<TUser>;
    update(id: string, data: Partial<TUser>): Promise<TUser | null>;
    delete(id: string): Promise<TUser | null>;
    updateStatus(id: string, status: string): Promise<TUser | null>;
    updateRole(id: string, role: string): Promise<TUser | null>;
}
export declare const userRepository: UserRepository;

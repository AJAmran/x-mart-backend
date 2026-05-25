import { SortOrder } from "mongoose";
type IPaginationOptions = {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: SortOrder;
};
type ICalculatePaginationResult = {
    page: number;
    limit: number;
    skip: number;
    sortBy: string;
    sortOrder: SortOrder;
};
export declare const paginationHelpers: {
    calculatePagination: (options: IPaginationOptions) => ICalculatePaginationResult;
};
export {};

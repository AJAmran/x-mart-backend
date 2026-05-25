import { BranchFilters, PaginationOptions, TBranch } from "../interface/branchInterface";
export declare const BranchService: {
    createBranch: (payload: TBranch) => Promise<import("mongoose").Document<unknown, {}, TBranch, {}, {}> & TBranch & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    getAllBranches: (filters: BranchFilters, options: PaginationOptions) => Promise<{
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        data: (import("mongoose").Document<unknown, {}, TBranch, {}, {}> & TBranch & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        })[];
    }>;
    getBranchById: (id: string) => Promise<import("mongoose").Document<unknown, {}, TBranch, {}, {}> & TBranch & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    updateBranch: (id: string, payload: Partial<TBranch>) => Promise<import("mongoose").Document<unknown, {}, TBranch, {}, {}> & TBranch & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    deleteBranch: (id: string) => Promise<import("mongoose").Document<unknown, {}, TBranch, {}, {}> & TBranch & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    getNearbyBranches: (lat: number, lng: number, maxDistance: number, limit: number) => Promise<(import("mongoose").Document<unknown, {}, TBranch, {}, {}> & TBranch & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    getBranchProducts: (branchId: string, filters: any, options: any) => Promise<{
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        data: (import("mongoose").Document<unknown, {}, import("../interface/productInterface").TProduct, {}, {}> & import("../interface/productInterface").TProduct & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        })[];
    }>;
    getBranchStaff: (branchId: string) => Promise<never[]>;
    getBranchTypes: () => Promise<string[]>;
    getBranchStatuses: () => Promise<string[]>;
};

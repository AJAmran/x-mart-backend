import { USER_ROLE, USER_STATUS } from "../constants/userConstant";
export declare const UserService: {
    getAllUsers: (filters: {
        search?: string;
        status?: string;
        role?: string;
    }, options: {
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
    }) => Promise<{
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        data: (import("mongoose").Document<unknown, {}, import("../interface/userInterface").TUser, {}, {}> & import("../interface/userInterface").TUser & Required<{
            _id: string;
        }> & {
            __v: number;
        })[];
    }>;
    getUserById: (id: string) => Promise<import("mongoose").Document<unknown, {}, import("../interface/userInterface").TUser, {}, {}> & import("../interface/userInterface").TUser & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
    updateUser: (id: string, payload: Partial<any>) => Promise<(import("mongoose").Document<unknown, {}, import("../interface/userInterface").TUser, {}, {}> & import("../interface/userInterface").TUser & Required<{
        _id: string;
    }> & {
        __v: number;
    }) | null>;
    deleteUser: (id: string) => Promise<import("mongoose").Document<unknown, {}, import("../interface/userInterface").TUser, {}, {}> & import("../interface/userInterface").TUser & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
    updateUserStatus: (id: string, status: keyof typeof USER_STATUS) => Promise<import("mongoose").Document<unknown, {}, import("../interface/userInterface").TUser, {}, {}> & import("../interface/userInterface").TUser & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
    updateUserRole: (id: string, role: keyof typeof USER_ROLE) => Promise<import("mongoose").Document<unknown, {}, import("../interface/userInterface").TUser, {}, {}> & import("../interface/userInterface").TUser & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
};

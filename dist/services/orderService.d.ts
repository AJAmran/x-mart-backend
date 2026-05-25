import { ORDER_STATUS, TOrder } from "../interface/orderInterface";
export declare const OrderService: {
    createOrder: (userId: string, payload: Partial<TOrder>) => Promise<import("mongoose").Document<unknown, {}, TOrder, {}, {}> & TOrder & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    getAllOrders: (filters: any, options: any) => Promise<{
        meta: {
            page: any;
            limit: any;
            total: number;
            totalPages: number;
        };
        data: (import("mongoose").Document<unknown, {}, TOrder, {}, {}> & TOrder & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        })[];
    }>;
    getOrderById: (id: string) => Promise<import("mongoose").Document<unknown, {}, TOrder, {}, {}> & TOrder & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    getUserOrders: (userId: string) => Promise<(import("mongoose").Document<unknown, {}, TOrder, {}, {}> & TOrder & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    updateOrderStatus: (id: string, status: keyof typeof ORDER_STATUS, note?: string) => Promise<(import("mongoose").Document<unknown, {}, TOrder, {}, {}> & TOrder & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    cancelOrder: (id: string, userId: string) => Promise<(import("mongoose").Document<unknown, {}, TOrder, {}, {}> & TOrder & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
};

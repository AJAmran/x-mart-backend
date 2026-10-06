import mongoose, { Types } from "mongoose";
import { ORDER_STATUS, TOrder } from "../interface/orderInterface";
export declare const OrderService: {
    createOrder: (userId: string, payload: Partial<TOrder>) => Promise<(mongoose.Document<unknown, {}, TOrder, {}, {}> & TOrder & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }) | undefined>;
    confirmPaymentAndDeductStock: (id: string) => Promise<void>;
    getAllOrders: (filters: {
        status?: string;
        userId?: string;
    }, options: {
        page: number;
        limit: number;
        sortBy: string;
        sortOrder: "asc" | "desc";
    }) => Promise<{
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        data: (mongoose.FlattenMaps<{
            userId: Types.ObjectId | string;
            items: {
                productId: Types.ObjectId | string;
                quantity: number;
                price: number;
                name: string;
                image: string;
            }[];
            shippingInfo: {
                name: string;
                email: string;
                addressLine1: string;
                addressLine2?: string | undefined;
                city: string;
                postalCode: string;
                division: string;
                phone: string;
            };
            totalPrice: number;
            branchId?: (Types.ObjectId | string) | undefined;
            status: keyof typeof ORDER_STATUS;
            paymentMethod: "CASH_ON_DELIVERY" | "ONLINE";
            stockDeducted?: boolean | undefined;
            idempotencyKey?: string | undefined;
            createdAt?: Date | undefined;
            updatedAt?: Date | undefined;
            trackingHistory: {
                status: keyof typeof ORDER_STATUS;
                updatedAt: Date;
                note?: string | undefined;
            }[];
        }> & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        })[];
    }>;
    getOrderById: (id: string) => Promise<mongoose.FlattenMaps<{
        userId: Types.ObjectId | string;
        items: {
            productId: Types.ObjectId | string;
            quantity: number;
            price: number;
            name: string;
            image: string;
        }[];
        shippingInfo: {
            name: string;
            email: string;
            addressLine1: string;
            addressLine2?: string | undefined;
            city: string;
            postalCode: string;
            division: string;
            phone: string;
        };
        totalPrice: number;
        branchId?: (Types.ObjectId | string) | undefined;
        status: keyof typeof ORDER_STATUS;
        paymentMethod: "CASH_ON_DELIVERY" | "ONLINE";
        stockDeducted?: boolean | undefined;
        idempotencyKey?: string | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
        trackingHistory: {
            status: keyof typeof ORDER_STATUS;
            updatedAt: Date;
            note?: string | undefined;
        }[];
    }> & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }>;
    getUserOrders: (userId: string) => Promise<(mongoose.FlattenMaps<{
        userId: Types.ObjectId | string;
        items: {
            productId: Types.ObjectId | string;
            quantity: number;
            price: number;
            name: string;
            image: string;
        }[];
        shippingInfo: {
            name: string;
            email: string;
            addressLine1: string;
            addressLine2?: string | undefined;
            city: string;
            postalCode: string;
            division: string;
            phone: string;
        };
        totalPrice: number;
        branchId?: (Types.ObjectId | string) | undefined;
        status: keyof typeof ORDER_STATUS;
        paymentMethod: "CASH_ON_DELIVERY" | "ONLINE";
        stockDeducted?: boolean | undefined;
        idempotencyKey?: string | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
        trackingHistory: {
            status: keyof typeof ORDER_STATUS;
            updatedAt: Date;
            note?: string | undefined;
        }[];
    }> & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    updateOrderStatus: (id: string, status: keyof typeof ORDER_STATUS, note?: string) => Promise<(mongoose.FlattenMaps<{
        userId: Types.ObjectId | string;
        items: {
            productId: Types.ObjectId | string;
            quantity: number;
            price: number;
            name: string;
            image: string;
        }[];
        shippingInfo: {
            name: string;
            email: string;
            addressLine1: string;
            addressLine2?: string | undefined;
            city: string;
            postalCode: string;
            division: string;
            phone: string;
        };
        totalPrice: number;
        branchId?: (Types.ObjectId | string) | undefined;
        status: keyof typeof ORDER_STATUS;
        paymentMethod: "CASH_ON_DELIVERY" | "ONLINE";
        stockDeducted?: boolean | undefined;
        idempotencyKey?: string | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
        trackingHistory: {
            status: keyof typeof ORDER_STATUS;
            updatedAt: Date;
            note?: string | undefined;
        }[];
    }> & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    cancelOrder: (id: string, userId: string) => Promise<(mongoose.FlattenMaps<{
        userId: Types.ObjectId | string;
        items: {
            productId: Types.ObjectId | string;
            quantity: number;
            price: number;
            name: string;
            image: string;
        }[];
        shippingInfo: {
            name: string;
            email: string;
            addressLine1: string;
            addressLine2?: string | undefined;
            city: string;
            postalCode: string;
            division: string;
            phone: string;
        };
        totalPrice: number;
        branchId?: (Types.ObjectId | string) | undefined;
        status: keyof typeof ORDER_STATUS;
        paymentMethod: "CASH_ON_DELIVERY" | "ONLINE";
        stockDeducted?: boolean | undefined;
        idempotencyKey?: string | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
        trackingHistory: {
            status: keyof typeof ORDER_STATUS;
            updatedAt: Date;
            note?: string | undefined;
        }[];
    }> & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
};

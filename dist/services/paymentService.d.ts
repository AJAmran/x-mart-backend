import mongoose from "mongoose";
export declare const PaymentService: {
    initPayment: (orderId: string, userId: string, amount: number, shippingInfo: {
        name: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        postalCode: string;
        division: string;
    }) => Promise<{
        GatewayPageURL: {};
        tranId: string;
        idempotent: boolean;
    }>;
    handleSuccess: (tranId: string, gatewayData: Record<string, unknown>) => Promise<mongoose.Document<unknown, {}, import("../interface/paymentInterface").TPayment, {}, {}> & import("../interface/paymentInterface").TPayment & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
    handleFail: (tranId: string, gatewayData?: Record<string, unknown>) => Promise<mongoose.Document<unknown, {}, import("../interface/paymentInterface").TPayment, {}, {}> & import("../interface/paymentInterface").TPayment & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
    handleCancel: (tranId: string) => Promise<mongoose.Document<unknown, {}, import("../interface/paymentInterface").TPayment, {}, {}> & import("../interface/paymentInterface").TPayment & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
    handleIpn: (tranId: string, gatewayData: Record<string, unknown>) => Promise<(mongoose.Document<unknown, {}, import("../interface/paymentInterface").TPayment, {}, {}> & import("../interface/paymentInterface").TPayment & Required<{
        _id: string;
    }> & {
        __v: number;
    }) | null>;
    getPaymentByOrderId: (orderId: string) => Promise<(mongoose.Document<unknown, {}, import("../interface/paymentInterface").TPayment, {}, {}> & import("../interface/paymentInterface").TPayment & Required<{
        _id: string;
    }> & {
        __v: number;
    }) | null>;
    getUserPayments: (userId: string, options: {
        page: number;
        limit: number;
    }) => Promise<{
        payments: (mongoose.FlattenMaps<{
            _id?: string | undefined;
            orderId: mongoose.Types.ObjectId | string;
            userId: mongoose.Types.ObjectId | string;
            tranId: string;
            amount: number;
            status: "INITIATED" | "SUCCESS" | "FAILED" | "CANCELLED";
            paymentMethod: string;
            gatewayData?: {
                [x: string]: unknown;
            } | undefined;
            createdAt?: Date | undefined;
            updatedAt?: Date | undefined;
        }> & Required<{
            _id: string;
        }> & {
            __v: number;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPage: number;
        };
    }>;
    getPaymentDetails: (userId: string, paymentId: string) => Promise<mongoose.FlattenMaps<{
        _id?: string | undefined;
        orderId: mongoose.Types.ObjectId | string;
        userId: mongoose.Types.ObjectId | string;
        tranId: string;
        amount: number;
        status: "INITIATED" | "SUCCESS" | "FAILED" | "CANCELLED";
        paymentMethod: string;
        gatewayData?: {
            [x: string]: unknown;
        } | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
    }> & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
};

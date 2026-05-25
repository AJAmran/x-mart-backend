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
        GatewayPageURL: string | undefined;
        tranId: string;
    }>;
    handleSuccess: (tranId: string, gatewayData: Record<string, unknown>) => Promise<import("mongoose").Document<unknown, {}, import("../interface/paymentInterface").TPayment, {}, {}> & import("../interface/paymentInterface").TPayment & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
    handleFail: (tranId: string, gatewayData?: Record<string, unknown>) => Promise<import("mongoose").Document<unknown, {}, import("../interface/paymentInterface").TPayment, {}, {}> & import("../interface/paymentInterface").TPayment & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
    handleCancel: (tranId: string) => Promise<import("mongoose").Document<unknown, {}, import("../interface/paymentInterface").TPayment, {}, {}> & import("../interface/paymentInterface").TPayment & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
    handleIpn: (tranId: string, gatewayData: Record<string, unknown>) => Promise<import("mongoose").Document<unknown, {}, import("../interface/paymentInterface").TPayment, {}, {}> & import("../interface/paymentInterface").TPayment & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
    getPaymentByOrderId: (orderId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../interface/paymentInterface").TPayment, {}, {}> & import("../interface/paymentInterface").TPayment & Required<{
        _id: string;
    }> & {
        __v: number;
    }) | null>;
};

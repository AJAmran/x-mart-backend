import { Types } from "mongoose";
export declare enum ORDER_STATUS {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED"
}
export type TOrderItem = {
    productId: Types.ObjectId | string;
    quantity: number;
    price: number;
    name: string;
    image: string;
};
export type TShippingInfo = {
    name: string;
    email: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode: string;
    division: string;
    phone: string;
};
export type TOrder = {
    userId: Types.ObjectId | string;
    items: TOrderItem[];
    shippingInfo: TShippingInfo;
    totalPrice: number;
    /** Branch chosen at checkout for fulfilment. Optional. */
    branchId?: Types.ObjectId | string;
    status: keyof typeof ORDER_STATUS;
    paymentMethod: "CASH_ON_DELIVERY" | "ONLINE";
    stockDeducted?: boolean;
    idempotencyKey?: string;
    createdAt?: Date;
    updatedAt?: Date;
    trackingHistory: {
        status: keyof typeof ORDER_STATUS;
        updatedAt: Date;
        note?: string;
    }[];
};

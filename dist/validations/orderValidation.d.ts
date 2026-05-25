import { z } from "zod";
export declare const OrderValidation: {
    createOrderValidationSchema: z.ZodObject<{
        body: z.ZodObject<{
            items: z.ZodArray<z.ZodObject<{
                productId: z.ZodString;
                quantity: z.ZodNumber;
                price: z.ZodNumber;
                name: z.ZodString;
                image: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                name: string;
                price: number;
                productId: string;
                quantity: number;
                image: string;
            }, {
                name: string;
                price: number;
                productId: string;
                quantity: number;
                image: string;
            }>, "many">;
            shippingInfo: z.ZodObject<{
                name: z.ZodString;
                email: z.ZodString;
                addressLine1: z.ZodString;
                addressLine2: z.ZodOptional<z.ZodString>;
                city: z.ZodString;
                postalCode: z.ZodString;
                division: z.ZodString;
                phone: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                name: string;
                email: string;
                phone: string;
                city: string;
                postalCode: string;
                addressLine1: string;
                division: string;
                addressLine2?: string | undefined;
            }, {
                name: string;
                email: string;
                phone: string;
                city: string;
                postalCode: string;
                addressLine1: string;
                division: string;
                addressLine2?: string | undefined;
            }>;
            paymentMethod: z.ZodEnum<["CASH_ON_DELIVERY", "ONLINE"]>;
        }, "strip", z.ZodTypeAny, {
            items: {
                name: string;
                price: number;
                productId: string;
                quantity: number;
                image: string;
            }[];
            shippingInfo: {
                name: string;
                email: string;
                phone: string;
                city: string;
                postalCode: string;
                addressLine1: string;
                division: string;
                addressLine2?: string | undefined;
            };
            paymentMethod: "CASH_ON_DELIVERY" | "ONLINE";
        }, {
            items: {
                name: string;
                price: number;
                productId: string;
                quantity: number;
                image: string;
            }[];
            shippingInfo: {
                name: string;
                email: string;
                phone: string;
                city: string;
                postalCode: string;
                addressLine1: string;
                division: string;
                addressLine2?: string | undefined;
            };
            paymentMethod: "CASH_ON_DELIVERY" | "ONLINE";
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            items: {
                name: string;
                price: number;
                productId: string;
                quantity: number;
                image: string;
            }[];
            shippingInfo: {
                name: string;
                email: string;
                phone: string;
                city: string;
                postalCode: string;
                addressLine1: string;
                division: string;
                addressLine2?: string | undefined;
            };
            paymentMethod: "CASH_ON_DELIVERY" | "ONLINE";
        };
    }, {
        body: {
            items: {
                name: string;
                price: number;
                productId: string;
                quantity: number;
                image: string;
            }[];
            shippingInfo: {
                name: string;
                email: string;
                phone: string;
                city: string;
                postalCode: string;
                addressLine1: string;
                division: string;
                addressLine2?: string | undefined;
            };
            paymentMethod: "CASH_ON_DELIVERY" | "ONLINE";
        };
    }>;
    updateOrderStatusValidationSchema: z.ZodObject<{
        body: z.ZodObject<{
            status: z.ZodEnum<["PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"]>;
            note: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
            note?: string | undefined;
        }, {
            status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
            note?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
            note?: string | undefined;
        };
    }, {
        body: {
            status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
            note?: string | undefined;
        };
    }>;
};

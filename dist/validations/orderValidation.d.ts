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
                phone: z.ZodEffects<z.ZodString, string, string>;
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
            /**
             * Fulfillment branch picked on the storefront.
             *
             * Without this key in the schema, zod stripped it and `validateRequest`
             * wrote back the stripped body — the branch selector silently had no effect.
             * Validated as a 24-hex ObjectId so a bad value fails loudly at the edge
             * instead of being cast to null deeper in.
             */
            branchId: z.ZodOptional<z.ZodString>;
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
            branchId?: string | undefined;
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
            branchId?: string | undefined;
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
            branchId?: string | undefined;
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
            branchId?: string | undefined;
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

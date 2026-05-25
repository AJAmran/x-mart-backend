import { z } from "zod";
export declare const ProductValidation: {
    createProductValidationSchema: z.ZodObject<{
        body: z.ZodObject<{
            name: z.ZodString;
            description: z.ZodString;
            price: z.ZodNumber;
            category: z.ZodEnum<["FISH" | "MEAT" | "FRUITS" | "VEGETABLES" | "DAIRY" | "FROZEN" | "GROCERY" | "PERSONALCARE" | "HOUSEHOLD" | "STATIONERY"]>;
            status: z.ZodOptional<z.ZodEnum<["ACTIVE" | "INACTIVE"]>>;
            stock: z.ZodNumber;
            images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            discount: z.ZodOptional<z.ZodObject<{
                type: z.ZodEnum<["percentage", "fixed"]>;
                value: z.ZodNumber;
                startDate: z.ZodOptional<z.ZodDate>;
                endDate: z.ZodOptional<z.ZodDate>;
            }, "strip", z.ZodTypeAny, {
                value: number;
                type: "fixed" | "percentage";
                startDate?: Date | undefined;
                endDate?: Date | undefined;
            }, {
                value: number;
                type: "fixed" | "percentage";
                startDate?: Date | undefined;
                endDate?: Date | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            description: string;
            price: number;
            category: "FISH" | "MEAT" | "FRUITS" | "VEGETABLES" | "DAIRY" | "FROZEN" | "GROCERY" | "PERSONALCARE" | "HOUSEHOLD" | "STATIONERY";
            stock: number;
            status?: "ACTIVE" | "INACTIVE" | undefined;
            images?: string[] | undefined;
            discount?: {
                value: number;
                type: "fixed" | "percentage";
                startDate?: Date | undefined;
                endDate?: Date | undefined;
            } | undefined;
        }, {
            name: string;
            description: string;
            price: number;
            category: "FISH" | "MEAT" | "FRUITS" | "VEGETABLES" | "DAIRY" | "FROZEN" | "GROCERY" | "PERSONALCARE" | "HOUSEHOLD" | "STATIONERY";
            stock: number;
            status?: "ACTIVE" | "INACTIVE" | undefined;
            images?: string[] | undefined;
            discount?: {
                value: number;
                type: "fixed" | "percentage";
                startDate?: Date | undefined;
                endDate?: Date | undefined;
            } | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            name: string;
            description: string;
            price: number;
            category: "FISH" | "MEAT" | "FRUITS" | "VEGETABLES" | "DAIRY" | "FROZEN" | "GROCERY" | "PERSONALCARE" | "HOUSEHOLD" | "STATIONERY";
            stock: number;
            status?: "ACTIVE" | "INACTIVE" | undefined;
            images?: string[] | undefined;
            discount?: {
                value: number;
                type: "fixed" | "percentage";
                startDate?: Date | undefined;
                endDate?: Date | undefined;
            } | undefined;
        };
    }, {
        body: {
            name: string;
            description: string;
            price: number;
            category: "FISH" | "MEAT" | "FRUITS" | "VEGETABLES" | "DAIRY" | "FROZEN" | "GROCERY" | "PERSONALCARE" | "HOUSEHOLD" | "STATIONERY";
            stock: number;
            status?: "ACTIVE" | "INACTIVE" | undefined;
            images?: string[] | undefined;
            discount?: {
                value: number;
                type: "fixed" | "percentage";
                startDate?: Date | undefined;
                endDate?: Date | undefined;
            } | undefined;
        };
    }>;
    updateProductValidationSchema: z.ZodObject<{
        body: z.ZodObject<{
            name: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            price: z.ZodOptional<z.ZodNumber>;
            category: z.ZodOptional<z.ZodEnum<["FISH" | "MEAT" | "FRUITS" | "VEGETABLES" | "DAIRY" | "FROZEN" | "GROCERY" | "PERSONALCARE" | "HOUSEHOLD" | "STATIONERY"]>>;
            status: z.ZodOptional<z.ZodEnum<["ACTIVE" | "INACTIVE"]>>;
            stock: z.ZodOptional<z.ZodNumber>;
            images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            discount: z.ZodOptional<z.ZodObject<{
                type: z.ZodEnum<["percentage", "fixed"]>;
                value: z.ZodNumber;
                startDate: z.ZodOptional<z.ZodDate>;
                endDate: z.ZodOptional<z.ZodDate>;
            }, "strip", z.ZodTypeAny, {
                value: number;
                type: "fixed" | "percentage";
                startDate?: Date | undefined;
                endDate?: Date | undefined;
            }, {
                value: number;
                type: "fixed" | "percentage";
                startDate?: Date | undefined;
                endDate?: Date | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            status?: "ACTIVE" | "INACTIVE" | undefined;
            name?: string | undefined;
            description?: string | undefined;
            images?: string[] | undefined;
            price?: number | undefined;
            category?: "FISH" | "MEAT" | "FRUITS" | "VEGETABLES" | "DAIRY" | "FROZEN" | "GROCERY" | "PERSONALCARE" | "HOUSEHOLD" | "STATIONERY" | undefined;
            stock?: number | undefined;
            discount?: {
                value: number;
                type: "fixed" | "percentage";
                startDate?: Date | undefined;
                endDate?: Date | undefined;
            } | undefined;
        }, {
            status?: "ACTIVE" | "INACTIVE" | undefined;
            name?: string | undefined;
            description?: string | undefined;
            images?: string[] | undefined;
            price?: number | undefined;
            category?: "FISH" | "MEAT" | "FRUITS" | "VEGETABLES" | "DAIRY" | "FROZEN" | "GROCERY" | "PERSONALCARE" | "HOUSEHOLD" | "STATIONERY" | undefined;
            stock?: number | undefined;
            discount?: {
                value: number;
                type: "fixed" | "percentage";
                startDate?: Date | undefined;
                endDate?: Date | undefined;
            } | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            status?: "ACTIVE" | "INACTIVE" | undefined;
            name?: string | undefined;
            description?: string | undefined;
            images?: string[] | undefined;
            price?: number | undefined;
            category?: "FISH" | "MEAT" | "FRUITS" | "VEGETABLES" | "DAIRY" | "FROZEN" | "GROCERY" | "PERSONALCARE" | "HOUSEHOLD" | "STATIONERY" | undefined;
            stock?: number | undefined;
            discount?: {
                value: number;
                type: "fixed" | "percentage";
                startDate?: Date | undefined;
                endDate?: Date | undefined;
            } | undefined;
        };
    }, {
        body: {
            status?: "ACTIVE" | "INACTIVE" | undefined;
            name?: string | undefined;
            description?: string | undefined;
            images?: string[] | undefined;
            price?: number | undefined;
            category?: "FISH" | "MEAT" | "FRUITS" | "VEGETABLES" | "DAIRY" | "FROZEN" | "GROCERY" | "PERSONALCARE" | "HOUSEHOLD" | "STATIONERY" | undefined;
            stock?: number | undefined;
            discount?: {
                value: number;
                type: "fixed" | "percentage";
                startDate?: Date | undefined;
                endDate?: Date | undefined;
            } | undefined;
        };
    }>;
    updateStockValidationSchema: z.ZodObject<{
        body: z.ZodObject<{
            stock: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            stock: number;
        }, {
            stock: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            stock: number;
        };
    }, {
        body: {
            stock: number;
        };
    }>;
    applyDiscountValidationSchema: z.ZodObject<{
        body: z.ZodObject<{
            type: z.ZodEnum<["percentage", "fixed"]>;
            value: z.ZodNumber;
            startDate: z.ZodOptional<z.ZodDate>;
            endDate: z.ZodOptional<z.ZodDate>;
        }, "strip", z.ZodTypeAny, {
            value: number;
            type: "fixed" | "percentage";
            startDate?: Date | undefined;
            endDate?: Date | undefined;
        }, {
            value: number;
            type: "fixed" | "percentage";
            startDate?: Date | undefined;
            endDate?: Date | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            value: number;
            type: "fixed" | "percentage";
            startDate?: Date | undefined;
            endDate?: Date | undefined;
        };
    }, {
        body: {
            value: number;
            type: "fixed" | "percentage";
            startDate?: Date | undefined;
            endDate?: Date | undefined;
        };
    }>;
};

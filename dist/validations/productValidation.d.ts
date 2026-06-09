import { z } from "zod";
export declare const ProductValidation: {
    createProductValidationSchema: z.ZodObject<{
        body: z.ZodObject<{
            name: z.ZodString;
            description: z.ZodString;
            price: z.ZodNumber;
            costPrice: z.ZodOptional<z.ZodNumber>;
            category: z.ZodEnum<["FISH" | "MEAT" | "FRUITS" | "VEGETABLES" | "DAIRY" | "FROZEN" | "GROCERY" | "PERSONALCARE" | "HOUSEHOLD" | "STATIONERY"]>;
            subCategory: z.ZodOptional<z.ZodString>;
            status: z.ZodOptional<z.ZodEnum<["ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "COMING_SOON"]>>;
            stock: z.ZodOptional<z.ZodNumber>;
            inventories: z.ZodArray<z.ZodObject<{
                stock: z.ZodNumber;
                lowStockThreshold: z.ZodOptional<z.ZodNumber>;
                branchId: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                stock: number;
                branchId: string;
                lowStockThreshold?: number | undefined;
            }, {
                stock: number;
                branchId: string;
                lowStockThreshold?: number | undefined;
            }>, "many">;
            images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            discount: z.ZodOptional<z.ZodObject<{
                type: z.ZodEnum<["percentage", "fixed"]>;
                value: z.ZodNumber;
                startDate: z.ZodOptional<z.ZodDate>;
                endDate: z.ZodOptional<z.ZodDate>;
                applicableBranches: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                value: number;
                type: "fixed" | "percentage";
                startDate?: Date | undefined;
                endDate?: Date | undefined;
                applicableBranches?: string[] | undefined;
            }, {
                value: number;
                type: "fixed" | "percentage";
                startDate?: Date | undefined;
                endDate?: Date | undefined;
                applicableBranches?: string[] | undefined;
            }>>;
            availability: z.ZodOptional<z.ZodEnum<["ALL_BRANCHES" | "SELECTED_BRANCHES" | "ONLINE_ONLY"]>>;
            availableBranches: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            operationType: z.ZodOptional<z.ZodEnum<["REGULAR" | "PROMOTIONAL" | "SEASONAL" | "LIMITED_EDITION"]>>;
            tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            weight: z.ZodOptional<z.ZodNumber>;
            dimensions: z.ZodOptional<z.ZodObject<{
                length: z.ZodOptional<z.ZodNumber>;
                width: z.ZodOptional<z.ZodNumber>;
                height: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                length?: number | undefined;
                width?: number | undefined;
                height?: number | undefined;
            }, {
                length?: number | undefined;
                width?: number | undefined;
                height?: number | undefined;
            }>>;
            manufacturer: z.ZodOptional<z.ZodString>;
            supplier: z.ZodOptional<z.ZodString>;
            barcode: z.ZodOptional<z.ZodString>;
            sku: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            description: string;
            price: number;
            category: "FISH" | "MEAT" | "FRUITS" | "VEGETABLES" | "DAIRY" | "FROZEN" | "GROCERY" | "PERSONALCARE" | "HOUSEHOLD" | "STATIONERY";
            inventories: {
                stock: number;
                branchId: string;
                lowStockThreshold?: number | undefined;
            }[];
            sku: string;
            status?: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "COMING_SOON" | undefined;
            images?: string[] | undefined;
            stock?: number | undefined;
            costPrice?: number | undefined;
            subCategory?: string | undefined;
            discount?: {
                value: number;
                type: "fixed" | "percentage";
                startDate?: Date | undefined;
                endDate?: Date | undefined;
                applicableBranches?: string[] | undefined;
            } | undefined;
            availability?: "ALL_BRANCHES" | "SELECTED_BRANCHES" | "ONLINE_ONLY" | undefined;
            availableBranches?: string[] | undefined;
            operationType?: "REGULAR" | "PROMOTIONAL" | "SEASONAL" | "LIMITED_EDITION" | undefined;
            tags?: string[] | undefined;
            weight?: number | undefined;
            dimensions?: {
                length?: number | undefined;
                width?: number | undefined;
                height?: number | undefined;
            } | undefined;
            manufacturer?: string | undefined;
            supplier?: string | undefined;
            barcode?: string | undefined;
        }, {
            name: string;
            description: string;
            price: number;
            category: "FISH" | "MEAT" | "FRUITS" | "VEGETABLES" | "DAIRY" | "FROZEN" | "GROCERY" | "PERSONALCARE" | "HOUSEHOLD" | "STATIONERY";
            inventories: {
                stock: number;
                branchId: string;
                lowStockThreshold?: number | undefined;
            }[];
            sku: string;
            status?: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "COMING_SOON" | undefined;
            images?: string[] | undefined;
            stock?: number | undefined;
            costPrice?: number | undefined;
            subCategory?: string | undefined;
            discount?: {
                value: number;
                type: "fixed" | "percentage";
                startDate?: Date | undefined;
                endDate?: Date | undefined;
                applicableBranches?: string[] | undefined;
            } | undefined;
            availability?: "ALL_BRANCHES" | "SELECTED_BRANCHES" | "ONLINE_ONLY" | undefined;
            availableBranches?: string[] | undefined;
            operationType?: "REGULAR" | "PROMOTIONAL" | "SEASONAL" | "LIMITED_EDITION" | undefined;
            tags?: string[] | undefined;
            weight?: number | undefined;
            dimensions?: {
                length?: number | undefined;
                width?: number | undefined;
                height?: number | undefined;
            } | undefined;
            manufacturer?: string | undefined;
            supplier?: string | undefined;
            barcode?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            name: string;
            description: string;
            price: number;
            category: "FISH" | "MEAT" | "FRUITS" | "VEGETABLES" | "DAIRY" | "FROZEN" | "GROCERY" | "PERSONALCARE" | "HOUSEHOLD" | "STATIONERY";
            inventories: {
                stock: number;
                branchId: string;
                lowStockThreshold?: number | undefined;
            }[];
            sku: string;
            status?: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "COMING_SOON" | undefined;
            images?: string[] | undefined;
            stock?: number | undefined;
            costPrice?: number | undefined;
            subCategory?: string | undefined;
            discount?: {
                value: number;
                type: "fixed" | "percentage";
                startDate?: Date | undefined;
                endDate?: Date | undefined;
                applicableBranches?: string[] | undefined;
            } | undefined;
            availability?: "ALL_BRANCHES" | "SELECTED_BRANCHES" | "ONLINE_ONLY" | undefined;
            availableBranches?: string[] | undefined;
            operationType?: "REGULAR" | "PROMOTIONAL" | "SEASONAL" | "LIMITED_EDITION" | undefined;
            tags?: string[] | undefined;
            weight?: number | undefined;
            dimensions?: {
                length?: number | undefined;
                width?: number | undefined;
                height?: number | undefined;
            } | undefined;
            manufacturer?: string | undefined;
            supplier?: string | undefined;
            barcode?: string | undefined;
        };
    }, {
        body: {
            name: string;
            description: string;
            price: number;
            category: "FISH" | "MEAT" | "FRUITS" | "VEGETABLES" | "DAIRY" | "FROZEN" | "GROCERY" | "PERSONALCARE" | "HOUSEHOLD" | "STATIONERY";
            inventories: {
                stock: number;
                branchId: string;
                lowStockThreshold?: number | undefined;
            }[];
            sku: string;
            status?: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "COMING_SOON" | undefined;
            images?: string[] | undefined;
            stock?: number | undefined;
            costPrice?: number | undefined;
            subCategory?: string | undefined;
            discount?: {
                value: number;
                type: "fixed" | "percentage";
                startDate?: Date | undefined;
                endDate?: Date | undefined;
                applicableBranches?: string[] | undefined;
            } | undefined;
            availability?: "ALL_BRANCHES" | "SELECTED_BRANCHES" | "ONLINE_ONLY" | undefined;
            availableBranches?: string[] | undefined;
            operationType?: "REGULAR" | "PROMOTIONAL" | "SEASONAL" | "LIMITED_EDITION" | undefined;
            tags?: string[] | undefined;
            weight?: number | undefined;
            dimensions?: {
                length?: number | undefined;
                width?: number | undefined;
                height?: number | undefined;
            } | undefined;
            manufacturer?: string | undefined;
            supplier?: string | undefined;
            barcode?: string | undefined;
        };
    }>;
    updateProductValidationSchema: z.ZodObject<{
        body: z.ZodObject<{
            name: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            price: z.ZodOptional<z.ZodNumber>;
            costPrice: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            category: z.ZodOptional<z.ZodEnum<["FISH" | "MEAT" | "FRUITS" | "VEGETABLES" | "DAIRY" | "FROZEN" | "GROCERY" | "PERSONALCARE" | "HOUSEHOLD" | "STATIONERY"]>>;
            subCategory: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            status: z.ZodOptional<z.ZodOptional<z.ZodEnum<["ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "COMING_SOON"]>>>;
            stock: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            inventories: z.ZodOptional<z.ZodArray<z.ZodObject<{
                stock: z.ZodNumber;
                lowStockThreshold: z.ZodOptional<z.ZodNumber>;
                branchId: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                stock: number;
                branchId: string;
                lowStockThreshold?: number | undefined;
            }, {
                stock: number;
                branchId: string;
                lowStockThreshold?: number | undefined;
            }>, "many">>;
            images: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
            discount: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                type: z.ZodEnum<["percentage", "fixed"]>;
                value: z.ZodNumber;
                startDate: z.ZodOptional<z.ZodDate>;
                endDate: z.ZodOptional<z.ZodDate>;
                applicableBranches: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                value: number;
                type: "fixed" | "percentage";
                startDate?: Date | undefined;
                endDate?: Date | undefined;
                applicableBranches?: string[] | undefined;
            }, {
                value: number;
                type: "fixed" | "percentage";
                startDate?: Date | undefined;
                endDate?: Date | undefined;
                applicableBranches?: string[] | undefined;
            }>>>;
            availability: z.ZodOptional<z.ZodOptional<z.ZodEnum<["ALL_BRANCHES" | "SELECTED_BRANCHES" | "ONLINE_ONLY"]>>>;
            availableBranches: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
            operationType: z.ZodOptional<z.ZodOptional<z.ZodEnum<["REGULAR" | "PROMOTIONAL" | "SEASONAL" | "LIMITED_EDITION"]>>>;
            tags: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
            weight: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            dimensions: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                length: z.ZodOptional<z.ZodNumber>;
                width: z.ZodOptional<z.ZodNumber>;
                height: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                length?: number | undefined;
                width?: number | undefined;
                height?: number | undefined;
            }, {
                length?: number | undefined;
                width?: number | undefined;
                height?: number | undefined;
            }>>>;
            manufacturer: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            supplier: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            barcode: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            sku: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            status?: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "COMING_SOON" | undefined;
            name?: string | undefined;
            description?: string | undefined;
            images?: string[] | undefined;
            stock?: number | undefined;
            price?: number | undefined;
            costPrice?: number | undefined;
            category?: "FISH" | "MEAT" | "FRUITS" | "VEGETABLES" | "DAIRY" | "FROZEN" | "GROCERY" | "PERSONALCARE" | "HOUSEHOLD" | "STATIONERY" | undefined;
            subCategory?: string | undefined;
            inventories?: {
                stock: number;
                branchId: string;
                lowStockThreshold?: number | undefined;
            }[] | undefined;
            discount?: {
                value: number;
                type: "fixed" | "percentage";
                startDate?: Date | undefined;
                endDate?: Date | undefined;
                applicableBranches?: string[] | undefined;
            } | undefined;
            availability?: "ALL_BRANCHES" | "SELECTED_BRANCHES" | "ONLINE_ONLY" | undefined;
            availableBranches?: string[] | undefined;
            operationType?: "REGULAR" | "PROMOTIONAL" | "SEASONAL" | "LIMITED_EDITION" | undefined;
            tags?: string[] | undefined;
            weight?: number | undefined;
            dimensions?: {
                length?: number | undefined;
                width?: number | undefined;
                height?: number | undefined;
            } | undefined;
            manufacturer?: string | undefined;
            supplier?: string | undefined;
            barcode?: string | undefined;
            sku?: string | undefined;
        }, {
            status?: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "COMING_SOON" | undefined;
            name?: string | undefined;
            description?: string | undefined;
            images?: string[] | undefined;
            stock?: number | undefined;
            price?: number | undefined;
            costPrice?: number | undefined;
            category?: "FISH" | "MEAT" | "FRUITS" | "VEGETABLES" | "DAIRY" | "FROZEN" | "GROCERY" | "PERSONALCARE" | "HOUSEHOLD" | "STATIONERY" | undefined;
            subCategory?: string | undefined;
            inventories?: {
                stock: number;
                branchId: string;
                lowStockThreshold?: number | undefined;
            }[] | undefined;
            discount?: {
                value: number;
                type: "fixed" | "percentage";
                startDate?: Date | undefined;
                endDate?: Date | undefined;
                applicableBranches?: string[] | undefined;
            } | undefined;
            availability?: "ALL_BRANCHES" | "SELECTED_BRANCHES" | "ONLINE_ONLY" | undefined;
            availableBranches?: string[] | undefined;
            operationType?: "REGULAR" | "PROMOTIONAL" | "SEASONAL" | "LIMITED_EDITION" | undefined;
            tags?: string[] | undefined;
            weight?: number | undefined;
            dimensions?: {
                length?: number | undefined;
                width?: number | undefined;
                height?: number | undefined;
            } | undefined;
            manufacturer?: string | undefined;
            supplier?: string | undefined;
            barcode?: string | undefined;
            sku?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            status?: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "COMING_SOON" | undefined;
            name?: string | undefined;
            description?: string | undefined;
            images?: string[] | undefined;
            stock?: number | undefined;
            price?: number | undefined;
            costPrice?: number | undefined;
            category?: "FISH" | "MEAT" | "FRUITS" | "VEGETABLES" | "DAIRY" | "FROZEN" | "GROCERY" | "PERSONALCARE" | "HOUSEHOLD" | "STATIONERY" | undefined;
            subCategory?: string | undefined;
            inventories?: {
                stock: number;
                branchId: string;
                lowStockThreshold?: number | undefined;
            }[] | undefined;
            discount?: {
                value: number;
                type: "fixed" | "percentage";
                startDate?: Date | undefined;
                endDate?: Date | undefined;
                applicableBranches?: string[] | undefined;
            } | undefined;
            availability?: "ALL_BRANCHES" | "SELECTED_BRANCHES" | "ONLINE_ONLY" | undefined;
            availableBranches?: string[] | undefined;
            operationType?: "REGULAR" | "PROMOTIONAL" | "SEASONAL" | "LIMITED_EDITION" | undefined;
            tags?: string[] | undefined;
            weight?: number | undefined;
            dimensions?: {
                length?: number | undefined;
                width?: number | undefined;
                height?: number | undefined;
            } | undefined;
            manufacturer?: string | undefined;
            supplier?: string | undefined;
            barcode?: string | undefined;
            sku?: string | undefined;
        };
    }, {
        body: {
            status?: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "COMING_SOON" | undefined;
            name?: string | undefined;
            description?: string | undefined;
            images?: string[] | undefined;
            stock?: number | undefined;
            price?: number | undefined;
            costPrice?: number | undefined;
            category?: "FISH" | "MEAT" | "FRUITS" | "VEGETABLES" | "DAIRY" | "FROZEN" | "GROCERY" | "PERSONALCARE" | "HOUSEHOLD" | "STATIONERY" | undefined;
            subCategory?: string | undefined;
            inventories?: {
                stock: number;
                branchId: string;
                lowStockThreshold?: number | undefined;
            }[] | undefined;
            discount?: {
                value: number;
                type: "fixed" | "percentage";
                startDate?: Date | undefined;
                endDate?: Date | undefined;
                applicableBranches?: string[] | undefined;
            } | undefined;
            availability?: "ALL_BRANCHES" | "SELECTED_BRANCHES" | "ONLINE_ONLY" | undefined;
            availableBranches?: string[] | undefined;
            operationType?: "REGULAR" | "PROMOTIONAL" | "SEASONAL" | "LIMITED_EDITION" | undefined;
            tags?: string[] | undefined;
            weight?: number | undefined;
            dimensions?: {
                length?: number | undefined;
                width?: number | undefined;
                height?: number | undefined;
            } | undefined;
            manufacturer?: string | undefined;
            supplier?: string | undefined;
            barcode?: string | undefined;
            sku?: string | undefined;
        };
    }>;
    updateStockValidationSchema: z.ZodObject<{
        body: z.ZodObject<{
            branchId: z.ZodString;
            stock: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            stock: number;
            branchId: string;
        }, {
            stock: number;
            branchId: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            stock: number;
            branchId: string;
        };
    }, {
        body: {
            stock: number;
            branchId: string;
        };
    }>;
    applyDiscountValidationSchema: z.ZodObject<{
        body: z.ZodObject<{
            type: z.ZodEnum<["percentage", "fixed"]>;
            value: z.ZodNumber;
            startDate: z.ZodOptional<z.ZodDate>;
            endDate: z.ZodOptional<z.ZodDate>;
            applicableBranches: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            value: number;
            type: "fixed" | "percentage";
            startDate?: Date | undefined;
            endDate?: Date | undefined;
            applicableBranches?: string[] | undefined;
        }, {
            value: number;
            type: "fixed" | "percentage";
            startDate?: Date | undefined;
            endDate?: Date | undefined;
            applicableBranches?: string[] | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            value: number;
            type: "fixed" | "percentage";
            startDate?: Date | undefined;
            endDate?: Date | undefined;
            applicableBranches?: string[] | undefined;
        };
    }, {
        body: {
            value: number;
            type: "fixed" | "percentage";
            startDate?: Date | undefined;
            endDate?: Date | undefined;
            applicableBranches?: string[] | undefined;
        };
    }>;
};

import { Types } from "mongoose";
import { PRODUCT_AVAILABILITY, PRODUCT_CATEGORY, PRODUCT_OPERATION_TYPES, PRODUCT_STATUS } from "../constants/productConstant";
export type TDiscount = {
    type: "percentage" | "fixed";
    value: number;
    startDate?: Date;
    endDate?: Date;
    applicableBranches?: Types.ObjectId[];
};
export type TInventory = {
    stock: number;
    lowStockThreshold: number;
    branchId: Types.ObjectId;
};
export type TProduct = {
    name: string;
    description: string;
    price: number;
    costPrice?: number;
    category: keyof typeof PRODUCT_CATEGORY;
    subCategory?: string;
    status: keyof typeof PRODUCT_STATUS;
    stock?: number;
    inventories: TInventory[];
    images: string[];
    discount?: TDiscount;
    availability: keyof typeof PRODUCT_AVAILABILITY;
    availableBranches?: Types.ObjectId[];
    operationType: keyof typeof PRODUCT_OPERATION_TYPES;
    tags?: string[];
    weight?: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
    };
    manufacturer?: string;
    supplier?: string;
    barcode?: string;
    sku: string;
    createdAt?: Date;
    updatedAt?: Date;
};

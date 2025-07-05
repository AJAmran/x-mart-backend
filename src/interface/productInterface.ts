import { PRODUCT_CATEGORY, PRODUCT_STATUS, PRODUCT_AVAILABILITY, PRODUCT_OPERATION_TYPES } from "../constants/productConstant";

export type TDiscount = {
  type: "percentage" | "fixed";
  value: number;
  startDate?: Date;
  endDate?: Date;
  applicableBranches?: string[];
};

export type TInventory = {
  stock: number;
  lowStockThreshold: number;
  branchId: string;
};

export type TProduct = {
  name: string;
  description: string;
  price: number;
  costPrice?: number;
  category: keyof typeof PRODUCT_CATEGORY;
  subCategory?: string;
  status: keyof typeof PRODUCT_STATUS;
  inventories: TInventory[];
  images: string[];
  discount?: TDiscount;
  availability: keyof typeof PRODUCT_AVAILABILITY;
  availableBranches?: string[];
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
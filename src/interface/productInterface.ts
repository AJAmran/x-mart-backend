import { PRODUCT_CATEGORY, PRODUCT_STATUS } from "../constants/productConstant";

export type TDiscount = {
  type: "percentage" | "fixed";
  value: number;
  startDate?: Date;
  endDate?: Date;
};

export type TProduct = {
  name: string;
  description: string;
  price: number;
  category: keyof typeof PRODUCT_CATEGORY;
  status: keyof typeof PRODUCT_STATUS;
  stock: number;
  images: string[];
  discount?: TDiscount;
  createdAt?: Date;
  updatedAt?: Date;
};

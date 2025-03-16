import { Types } from "mongoose";

export type TCartItem = {
  productId: Types.ObjectId;
  quantity: number;
  price: number;
  name: string;
  image: string;
};

export type TCart = {
  userId?: Types.ObjectId;
  items: TCartItem[];
  totalPrice: number;
  totalItems: number;
};

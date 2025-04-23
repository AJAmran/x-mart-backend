export enum ORDER_STATUS {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export type TOrderItem = {
  productId: string;
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
  userId: string;
  items: TOrderItem[];
  shippingInfo: TShippingInfo;
  totalPrice: number;
  status: keyof typeof ORDER_STATUS;
  paymentMethod: "CASH_ON_DELIVERY" | "ONLINE";
  createdAt?: Date;
  updatedAt?: Date;
  trackingHistory: {
    status: keyof typeof ORDER_STATUS;
    updatedAt: Date;
    note?: string;
  }[];
};

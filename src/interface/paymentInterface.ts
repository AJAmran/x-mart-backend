export type TPayment = {
  _id?: string;
  orderId: string;
  userId: string;
  tranId: string;
  amount: number;
  status: "INITIATED" | "SUCCESS" | "FAILED" | "CANCELLED";
  paymentMethod: string;
  gatewayData?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
};

export type TSSLCommerzInitResponse = {
  status: "success" | "fail";
  failedreason?: string;
  sessionkey?: string;
  GatewayPageURL?: string;
};

declare module "sslcommerz-lts" {
  interface SSLCommerzInitData {
    total_amount: number;
    currency: string;
    tran_id: string;
    success_url: string;
    fail_url: string;
    cancel_url: string;
    ipn_url: string;
    shipping_method: string;
    product_name: string;
    product_category: string;
    product_profile: string;
    cus_name: string;
    cus_email: string;
    cus_add1: string;
    cus_city: string;
    cus_postcode: string;
    cus_country: string;
    cus_phone: string;
    ship_name: string;
    ship_add1: string;
    ship_city: string;
    ship_postcode: string;
    ship_country: string;
    multi_card_name?: string;
    value_a?: string;
    value_b?: string;
    [key: string]: unknown;
  }

  interface SSLCommerzInitResponse {
    // V4 API returns uppercase status: "SUCCESS" | "FAILED"
    status: string;
    failedreason?: string;
    sessionkey?: string;
    GatewayPageURL?: string;
    [key: string]: unknown;
  }

  interface SSLCommerzValidationResponse {
    // "VALID", "VALIDATED", "FAILED", "CANCELLED", "EXPIRED", "INVALID_TRANSACTION", ...
    status?: string;
    // The merchant tran_id query wraps matches in `element` (one per attempt).
    element?: Array<{ val_id?: string; tran_id?: string; status?: string; amount?: string }>;
    [key: string]: unknown;
  }

  class SSLCommerzPayment {
    constructor(storeId: string, storePassword: string, isSandbox: boolean);
    init(data: SSLCommerzInitData): Promise<SSLCommerzInitResponse>;
    validate(data: { val_id: string }): Promise<SSLCommerzValidationResponse>;
    transactionQueryByTransactionId(data: {
      tran_id: string;
    }): Promise<SSLCommerzValidationResponse>;
  }

  export default SSLCommerzPayment;
}

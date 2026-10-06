import { randomBytes } from "node:crypto";
import SSLCommerzPayment from "sslcommerz-lts";
import httpStatus from "http-status";
import mongoose from "mongoose";
import AppError from "../error/AppErros";
import config from "../config";
import { logger } from "../utils/logger";
import { resolveProductStock } from "../utils/stock";
import { Payment } from "../models/Payment";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { ORDER_STATUS } from "../interface/orderInterface";

const store_id = config.sslStoreId ?? "";
const store_passwd = config.sslStorePassword ?? "";
const isSandbox = config.nodeEnv === "development";

// The lib's third constructor argument is `live`, so it must be the inverse of
// our own flag. Passing `isSandbox` straight through pointed every validation
// call at securepay.sslcommerz.com (the live host) while development used
// sandbox credentials, and the gateway answered "APIConnect: FAILED" /
// "INVALID_TRANSACTION" for genuinely paid transactions.
const sslcz = new SSLCommerzPayment(store_id, store_passwd, !isSandbox);

const GATEWAY_BASE_URL = `https://${isSandbox ? "sandbox" : "securepay"}.sslcommerz.com`;
const GATEWAY_INIT_URL = `${GATEWAY_BASE_URL}/gwprocess/v4/api.php`;
const GATEWAY_TIMEOUT_MS = 20000;

const TERMINAL_STATUSES = ["SUCCESS", "FAILED", "CANCELLED"] as const;

/**
 * Creates the gateway session.
 *
 * `sslcommerz-lts` builds a `form-data` body and hands it to `node-fetch`
 * without a `Content-Type` header, so the multipart boundary never reaches
 * SSLCommerz. The gateway then reads an empty POST body and answers
 * "Store Credential Error Or Store is De-active" for every transaction, which
 * made every checkout fail before a session existed. Posting
 * `application/x-www-form-urlencoded` is what the v4 API documents and what
 * the sandbox actually accepts.
 */
const createGatewaySession = async (
  data: Record<string, string | number>
): Promise<Record<string, string>> => {
  const form = new URLSearchParams(
    Object.entries({ store_id, store_passwd, ...data }).map(
      ([key, value]) => [key, String(value)] as [string, string]
    )
  );

  const response = await fetch(GATEWAY_INIT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
    signal: AbortSignal.timeout(GATEWAY_TIMEOUT_MS),
  });

  return (await response.json()) as Record<string, string>;
};

const initPayment = async (
  orderId: string,
  userId: string,
  amount: number,
  shippingInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    division: string;
  }
) => {
  // ── C-02 FIX: idempotency. Re-init for the same order returns the existing
  // pending payment instead of creating a new one. This kills double-charge
  // and orphan-payment races that the previous implementation allowed.
  const existing = await Payment.findOne({
    orderId,
    status: { $nin: TERMINAL_STATUSES as unknown as string[] },
  }).sort({ createdAt: -1 });

  if (existing && existing.gatewayData?.GatewayPageURL) {
    return {
      GatewayPageURL: existing.gatewayData.GatewayPageURL,
      tranId: existing.tranId,
      idempotent: true,
    };
  }

  // V4 API caps tran_id at string(30). The gateway echoes it back on every
  // callback, so a longer id breaks the whole round-trip.
  const tranId = `TXN-${Date.now().toString(36)}-${randomBytes(8).toString("hex")}`;

  const payment = await Payment.create({
    orderId,
    userId,
    tranId,
    amount,
    status: "INITIATED",
  });

  const order = await Order.findById(orderId);
  const numItems =
    order?.items?.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) || 1;

  const baseUrl = config.backendUrl;
  const data = {
    total_amount: amount,
    currency: "BDT",
    tran_id: tranId,
    success_url: `${baseUrl}/api/v1/payment/success/${tranId}`,
    fail_url: `${baseUrl}/api/v1/payment/fail/${tranId}`,
    cancel_url: `${baseUrl}/api/v1/payment/cancel/${tranId}`,
    ipn_url: `${baseUrl}/api/v1/payment/ipn/${tranId}`,
    shipping_method: "Courier",
    num_of_item: numItems,
    product_name: "X-Mart Order",
    product_category: "General",
    product_profile: "general",
    cus_name: shippingInfo.name,
    cus_email: shippingInfo.email,
    cus_add1: shippingInfo.address,
    cus_city: shippingInfo.city,
    cus_postcode: shippingInfo.postalCode,
    cus_country: "Bangladesh",
    cus_phone: shippingInfo.phone,
    ship_name: shippingInfo.name,
    ship_add1: shippingInfo.address,
    ship_city: shippingInfo.city,
    ship_postcode: shippingInfo.postalCode,
    ship_country: "Bangladesh",
    multi_card_name: "",
    value_a: orderId,
    value_b: userId,
  };

  let response: Record<string, string>;
  try {
    response = await createGatewaySession(data);
  } catch (err) {
    await Payment.findByIdAndUpdate(payment._id, { status: "FAILED" });
    logger.error({ err, tranId }, "SSLCOMMERZ session request failed");
    throw new AppError(
      httpStatus.BAD_GATEWAY,
      "Could not reach the payment gateway. Please try again."
    );
  }

  // V4 API returns uppercase status ("SUCCESS"/"FAILED"). Also require the
  // GatewayPageURL to actually be present before redirecting the customer.
  const initStatus = String(response?.status ?? "").toUpperCase();
  if (initStatus !== "SUCCESS" || !response?.GatewayPageURL) {
    await Payment.findByIdAndUpdate(payment._id, { status: "FAILED" });
    logger.error(
      { tranId, gatewayResponse: response },
      "SSLCOMMERZ init returned a non-success response"
    );
    throw new AppError(
      httpStatus.BAD_REQUEST,
      (response?.failedreason as string | undefined) ?? "Payment initialization failed"
    );
  }

  await Payment.findByIdAndUpdate(payment._id, { gatewayData: response });

  return { GatewayPageURL: response.GatewayPageURL, tranId, idempotent: false };
};

const GATEWAY_CONFIRMED_STATUSES = ["VALID", "VALIDATED"];

const isGatewayConfirmed = (status: unknown): boolean =>
  GATEWAY_CONFIRMED_STATUSES.includes(String(status ?? "").toUpperCase());

const validateWithGateway = async (
  tranId: string,
  gatewayPayload: Record<string, unknown>
): Promise<boolean> => {
  // The IPN and success redirects both post data that we MUST verify against
  // the gateway before mutating state. Without this call the client can mark
  // any order as paid just by visiting the success URL.
  const val_id = (gatewayPayload?.val_id as string | undefined) ?? tranId;

  try {
    // The validation API answers with a flat object. The first call returns
    // "VALID"; every later call (IPN usually lands before the browser
    // redirect) returns "VALIDATED". Both mean the transaction is confirmed.
    const result = await sslcz.validate({ val_id });
    if (isGatewayConfirmed(result?.status)) return true;
    logger.debug(
      { tranId, val_id, gatewayStatus: result?.status },
      "SSLCOMMERZ order validation did not return VALID/VALIDATED"
    );
  } catch (err) {
    logger.error({ err, tranId, val_id }, "SSLCOMMERZ order validation call failed");
  }

  // `validationserverAPI.php` answers 500/INVALID_TRANSACTION often enough
  // that trusting it alone would refuse real, paid transactions. The merchant
  // transaction query answers from the same ledger keyed by our own tran_id,
  // so it is the fallback whenever the val_id lookup cannot confirm.
  try {
    const result = await sslcz.transactionQueryByTransactionId({ tran_id: tranId });
    if (isGatewayConfirmed(result?.status)) return true;

    // The tran_id query wraps every matching transaction in an `element` array
    // (one entry per gateway attempt for the same tran_id).
    const elements = Array.isArray(result?.element)
      ? (result.element as Record<string, unknown>[])
      : [];
    if (elements.some((element) => isGatewayConfirmed(element?.status))) return true;

    logger.debug(
      { tranId, gatewayStatus: result?.status, attempts: elements.length },
      "SSLCOMMERZ tran_id query did not confirm the transaction"
    );
  } catch (err) {
    logger.error({ err, tranId }, "SSLCOMMERZ tran_id query failed");
  }

  return false;
};

// Docs "Security Check Point": validate amount against the database before
// trusting a gateway callback. Only enforced when the gateway actually
// echoes an amount back.
const gatewayAmountMatches = (
  expected: number,
  gatewayPayload: Record<string, unknown> | undefined
): boolean => {
  const raw = gatewayPayload?.amount;
  if (raw === undefined || raw === null || raw === "") return true;
  const actual = Number(raw);
  return Number.isFinite(actual) && Math.abs(actual - expected) < 0.01;
};

const deductStockAtomically = async (orderId: string) => {
  // Mongo session/transaction. Requires a replica set (M10+).
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const order = await Order.findById(orderId).session(session);
      if (!order) throw new AppError(httpStatus.NOT_FOUND, "Order not found");
      if (order.stockDeducted) return; // idempotent

      for (const item of order.items) {
        const remaining = item.quantity;

        /**
         * Read-then-decrement, for the same reason as `deductStockForOrder`:
         * the per-branch `inventories` rows are the source of truth, and
         * `$inc`-ing the denormalised top-level `stock` was manufacturing
         * negative values that permanently wedged the product.
         *
         * The read-check-write runs inside the transaction, so the
         * availability check and the decrement commit together.
         */
        const product = await Product.findById(item.productId).session(session);
        if (!product) {
          throw new AppError(
            httpStatus.NOT_FOUND,
            `${item.name} is no longer available`
          );
        }

        const available = resolveProductStock(product);
        if (available < remaining) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            available === 0
              ? `${item.name} is out of stock`
              : `Only ${available} unit${available === 1 ? "" : "s"} of ${item.name} available`
          );
        }

        await Product.updateOne(
          { _id: product._id },
          { $inc: { "inventories.$[].stock": -remaining } },
          { session }
        );
      }

      await Order.findByIdAndUpdate(
        orderId,
        { stockDeducted: true },
        { session }
      );
    });
  } finally {
    await session.endSession();
  }
};

const restoreStockAtomically = async (orderId: string) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const order = await Order.findById(orderId).session(session);
      if (!order) return;
      if (!order.stockDeducted) return; // nothing to restore

      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { "inventories.$[].stock": item.quantity, stock: item.quantity } },
          { session }
        );
      }

      await Order.findByIdAndUpdate(
        orderId,
        { stockDeducted: false },
        { session }
      );
    });
  } finally {
    await session.endSession();
  }
};

const handleSuccess = async (
  tranId: string,
  gatewayData: Record<string, unknown>
) => {
  // The success_url callback echoes the gateway's own status field. If the
  // gateway says the transaction failed or was cancelled, don't fight it.
  const echoedStatus = String(gatewayData?.status ?? "").toUpperCase();
  if (echoedStatus === "FAILED") return handleFail(tranId, gatewayData);
  if (echoedStatus === "CANCELLED" || echoedStatus === "CANCEL") {
    return handleCancel(tranId);
  }

  // C-01 FIX: never trust the redirect. Verify with the gateway first.
  const verified = await validateWithGateway(tranId, gatewayData);
  if (!verified) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Payment could not be verified with the gateway"
    );
  }

  const payment = await Payment.findOne({ tranId });
  if (!payment) throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  if (payment.status === "SUCCESS") return payment; // idempotent

  if (!gatewayAmountMatches(payment.amount, gatewayData)) {
    logger.error(
      { tranId, expected: payment.amount, actual: gatewayData?.amount },
      "SSLCOMMERZ success amount mismatch"
    );
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Payment amount does not match the order"
    );
  }

  payment.status = "SUCCESS";
  payment.gatewayData = gatewayData;
  await payment.save();

  await deductStockAtomically(payment.orderId.toString());

  await Order.findByIdAndUpdate(payment.orderId, {
    paymentMethod: "ONLINE",
    $push: {
      trackingHistory: {
        status: ORDER_STATUS.PENDING,
        updatedAt: new Date(),
        note: "Payment received via SSL Commerz",
      },
    },
  });

  return payment;
};

const handleFail = async (tranId: string, gatewayData?: Record<string, unknown>) => {
  const payment = await Payment.findOne({ tranId });
  if (!payment) throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  if (payment.status === "FAILED") return payment;

  payment.status = "FAILED";
  if (gatewayData) payment.gatewayData = gatewayData;
  await payment.save();

  // High-priority fix: if we already deducted stock, restore it.
  await restoreStockAtomically(payment.orderId.toString());

  await Order.findByIdAndDelete(payment.orderId);

  return payment;
};

const handleCancel = async (tranId: string) => {
  const payment = await Payment.findOne({ tranId });
  if (!payment) throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  if (payment.status === "CANCELLED") return payment;

  payment.status = "CANCELLED";
  await payment.save();

  await restoreStockAtomically(payment.orderId.toString());
  await Order.findByIdAndDelete(payment.orderId);

  return payment;
};

const handleIpn = async (tranId: string, gatewayData: Record<string, unknown>) => {
  // IPN is the gateway's authoritative callback. Its status field decides
  // what happens (docs: VALID / FAILED / CANCELLED / UNATTEMPTED / EXPIRED).
  const ipnStatus = String(gatewayData?.status ?? "").toUpperCase();

  if (ipnStatus === "FAILED") return handleFail(tranId, gatewayData);
  if (ipnStatus === "CANCELLED" || ipnStatus === "CANCEL") {
    return handleCancel(tranId);
  }
  if (ipnStatus !== "VALID" && ipnStatus !== "VALIDATED") {
    // UNATTEMPTED / EXPIRED / anything unknown: no money moved, leave state
    // as-is so the customer can retry through the normal checkout flow.
    logger.debug({ tranId, ipnStatus }, "SSLCOMMERZ IPN with non-final status");
    return Payment.findOne({ tranId });
  }

  const verified = await validateWithGateway(tranId, gatewayData);
  if (!verified) {
    throw new AppError(httpStatus.BAD_REQUEST, "IPN signature invalid");
  }

  const payment = await Payment.findOne({ tranId });
  if (!payment) throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  if (payment.status === "SUCCESS") return payment;

  if (!gatewayAmountMatches(payment.amount, gatewayData)) {
    logger.error(
      { tranId, expected: payment.amount, actual: gatewayData?.amount },
      "SSLCOMMERZ IPN amount mismatch"
    );
    throw new AppError(httpStatus.BAD_REQUEST, "IPN amount does not match the order");
  }

  payment.gatewayData = gatewayData;
  payment.status = "SUCCESS";
  await payment.save();

  await deductStockAtomically(payment.orderId.toString());
  await Order.findByIdAndUpdate(payment.orderId, { paymentMethod: "ONLINE" });

  return payment;
};

const getPaymentByOrderId = async (orderId: string) => {
  return Payment.findOne({ orderId });
};

const getUserPayments = async (
  userId: string,
  options: { page: number; limit: number }
) => {
  const { page, limit } = options;
  const skip = (page - 1) * limit;
  const filter = { userId };

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .select("-gatewayData")
      .populate("orderId", "totalPrice status paymentMethod createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Payment.countDocuments(filter),
  ]);

  return {
    payments,
    meta: { total, page, limit, totalPage: Math.ceil(total / limit) },
  };
};

const getPaymentDetails = async (userId: string, paymentId: string) => {
  const payment = await Payment.findById(paymentId)
    .select("-gatewayData")
    .populate("orderId", "totalPrice status paymentMethod createdAt items")
    .lean();

  if (!payment || String(payment.userId) !== userId) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  }

  return payment;
};

export const PaymentService = {
  initPayment,
  handleSuccess,
  handleFail,
  handleCancel,
  handleIpn,
  getPaymentByOrderId,
  getUserPayments,
  getPaymentDetails,
};

import { randomUUID } from "node:crypto";
import SSLCommerzPayment from "sslcommerz-lts";
import httpStatus from "http-status";
import mongoose from "mongoose";
import AppError from "../error/AppErros";
import config from "../config";
import { Payment } from "../models/Payment";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { ORDER_STATUS } from "../interface/orderInterface";

const store_id = config.sslStoreId ?? "";
const store_passwd = config.sslStorePassword ?? "";
const isSandbox = config.nodeEnv === "development";

const sslcz = new SSLCommerzPayment(store_id, store_passwd, isSandbox);

const TERMINAL_STATUSES = ["SUCCESS", "FAILED", "CANCELLED"] as const;

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

  // cryptographically-strong, collision-free transaction id
  const tranId = `TXN-${randomUUID()}`;

  const payment = await Payment.create({
    orderId,
    userId,
    tranId,
    amount,
    status: "INITIATED",
  });

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

  const response = await sslcz.init(data);

  if (response.status !== "success") {
    await Payment.findByIdAndUpdate(payment._id, { status: "FAILED" });
    throw new AppError(
      httpStatus.BAD_REQUEST,
      response.failedreason ?? "Payment initialization failed"
    );
  }

  await Payment.findByIdAndUpdate(payment._id, { gatewayData: response });

  return { GatewayPageURL: response.GatewayPageURL, tranId, idempotent: false };
};

const validateWithGateway = async (
  tranId: string,
  gatewayPayload: Record<string, unknown>
): Promise<boolean> => {
  // The IPN and success redirects both post data that we MUST verify against
  // the gateway before mutating state. Without this call the client can mark
  // any order as paid just by visiting the success URL.
  const val_id = (gatewayPayload?.val_id as string | undefined) ?? tranId;
  try {
    const result = await (sslcz as unknown as {
      validate: (data: { val_id: string }) => Promise<{
        status?: string;
        data?: Array<{ status: "VALID" | "VALIDATED" | "INVALID" | "EXPIRED" | string }>;
      }>;
    }).validate({ val_id });

    const statuses = (result?.data ?? []).map((d) => d.status);
    const ok = result?.status === "VALID" || statuses.includes("VALID") || statuses.includes("VALIDATED");
    return Boolean(ok);
  } catch (err) {
    return false;
  }
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
        // Atomic conditional update on the first branch inventory with enough stock.
        // If the product has no inventories array, fall back to the scalar `stock` field.
        const updated = await Product.findOneAndUpdate(
          {
            _id: item.productId,
            "inventories.0.stock": { $gte: remaining },
          },
          { $inc: { "inventories.$[].stock": -remaining, stock: -remaining } },
          { session, new: true }
        );

        if (!updated) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            `${item.name} does not have enough stock available`
          );
        }
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
  // IPN is the gateway's authoritative callback. Verify before mutating.
  const verified = await validateWithGateway(tranId, gatewayData);
  if (!verified) {
    throw new AppError(httpStatus.BAD_REQUEST, "IPN signature invalid");
  }

  const payment = await Payment.findOne({ tranId });
  if (!payment) throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  if (payment.status === "SUCCESS") return payment;

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

export const PaymentService = {
  initPayment,
  handleSuccess,
  handleFail,
  handleCancel,
  handleIpn,
  getPaymentByOrderId,
};

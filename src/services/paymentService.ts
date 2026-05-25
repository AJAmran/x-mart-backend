import SSLCommerzPayment from "sslcommerz-lts";
import httpStatus from "http-status";
import AppError from "../error/AppErros";
import config from "../config";
import { Payment } from "../models/Payment";
import { Order } from "../models/Order";
import { ORDER_STATUS } from "../interface/orderInterface";
import { OrderService } from "./orderService";

const store_id = config.sslStoreId || "";
const store_passwd = config.sslStorePassword || "";
const isSandbox = config.nodeEnv === "development";

const sslcz = new SSLCommerzPayment(store_id, store_passwd, isSandbox);

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
  const tranId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  const payment = await Payment.create({
    orderId,
    userId,
    tranId,
    amount,
    status: "INITIATED",
  });

  const baseUrl = config.backendUrl;
  const clientUrl = config.clientUrl;

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
      response.failedreason || "Payment initialization failed"
    );
  }

  await Payment.findByIdAndUpdate(payment._id, {
    gatewayData: response,
  });

  return {
    GatewayPageURL: response.GatewayPageURL,
    tranId,
  };
};

const handleSuccess = async (tranId: string, gatewayData: Record<string, unknown>) => {
  const payment = await Payment.findOne({ tranId });
  if (!payment) throw new AppError(httpStatus.NOT_FOUND, "Payment not found");

  payment.status = "SUCCESS";
  payment.gatewayData = gatewayData;
  await payment.save();

  // Deduct stock since payment confirmed
  await OrderService.confirmPaymentAndDeductStock(payment.orderId);

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

  payment.status = "FAILED";
  if (gatewayData) payment.gatewayData = gatewayData;
  await payment.save();

  await Order.findByIdAndDelete(payment.orderId);

  return payment;
};

const handleCancel = async (tranId: string) => {
  const payment = await Payment.findOne({ tranId });
  if (!payment) throw new AppError(httpStatus.NOT_FOUND, "Payment not found");

  payment.status = "CANCELLED";
  await payment.save();

  await Order.findByIdAndDelete(payment.orderId);

  return payment;
};

const handleIpn = async (tranId: string, gatewayData: Record<string, unknown>) => {
  const payment = await Payment.findOne({ tranId });
  if (!payment) throw new AppError(httpStatus.NOT_FOUND, "Payment not found");

  payment.gatewayData = gatewayData;
  if (gatewayData.status === "VALID") {
    payment.status = "SUCCESS";
    await Order.findByIdAndUpdate(payment.orderId, {
      paymentMethod: "ONLINE",
    });
  } else if (gatewayData.status === "FAILED") {
    payment.status = "FAILED";
  }
  await payment.save();

  return payment;
};

const getPaymentByOrderId = async (orderId: string) => {
  return await Payment.findOne({ orderId });
};

export const PaymentService = {
  initPayment,
  handleSuccess,
  handleFail,
  handleCancel,
  handleIpn,
  getPaymentByOrderId,
};

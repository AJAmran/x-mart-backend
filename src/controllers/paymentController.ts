import { Request, Response } from "express";
import { PaymentService } from "../services/paymentService";
import { OrderService } from "../services/orderService";
import httpStatus from "http-status";
import config from "../config";
import AppError from "../error/AppErros";

const isTrustedGatewayOrigin = (origin: string | undefined): boolean => {
  if (!origin) return false;
  const trusted = [
    "https://securepay.sslcommerz.com",
    "https://sandbox.sslcommerz.com",
    "sandbox.sslcommerz.com",
    "securepay.sslcommerz.com",
  ];
  return trusted.some((host) => origin.includes(host));
};

const initPayment = async (req: Request, res: Response) => {
  const { orderId, idempotencyKey } = req.body as { orderId: string; idempotencyKey?: string };
  const userId = (req.user as { _id?: string } | undefined)?._id;

  const order = await OrderService.getOrderById(orderId);
  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  // High-priority: A01 IDOR — users can only init payment for their own orders
  if (
    (req.user as { role?: string } | undefined)?.role !== "ADMIN" &&
    String((order as { userId: unknown }).userId) !== userId
  ) {
    throw new AppError(httpStatus.FORBIDDEN, "Not your order");
  }

  const result = await PaymentService.initPayment(
    orderId,
    String(userId),
    order.totalPrice,
    {
      name: order.shippingInfo.name,
      email: order.shippingInfo.email,
      phone: order.shippingInfo.phone,
      address: order.shippingInfo.addressLine1,
      city: order.shippingInfo.city,
      postalCode: order.shippingInfo.postalCode,
      division: order.shippingInfo.division,
    }
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: result.idempotent ? "Payment session already in progress" : "Payment initiated",
    data: result,
  });
};

const handleSuccess = async (req: Request, res: Response) => {
  const { tranId } = req.params;
  // C-01 FIX is inside PaymentService.handleSuccess — it calls the gateway
  // validation API and refuses to mark the order paid if the call fails.
  const payment = await PaymentService.handleSuccess(tranId, req.body);
  const orderId = payment.orderId;
  res.redirect(
    `${config.clientUrl}/payment/success?tranId=${tranId}&orderId=${orderId}`
  );
};

const handleFail = async (req: Request, res: Response) => {
  const { tranId } = req.params;
  await PaymentService.handleFail(tranId, req.body);
  res.redirect(`${config.clientUrl}/payment/fail?tranId=${tranId}`);
};

const handleCancel = async (req: Request, res: Response) => {
  const { tranId } = req.params;
  await PaymentService.handleCancel(tranId);
  res.redirect(`${config.clientUrl}/payment/cancel?tranId=${tranId}`);
};

const handleIpn = async (req: Request, res: Response) => {
  // The IPN POST is allowed only from the gateway origin. Other callers get 403.
  const origin = (req.headers.origin || req.headers.referer) as string | undefined;
  if (!isTrustedGatewayOrigin(origin)) {
    return res.status(httpStatus.FORBIDDEN).json({ success: false, message: "Forbidden" });
  }
  const { tranId } = req.params;
  await PaymentService.handleIpn(tranId, req.body);
  res.status(httpStatus.OK).json({ success: true });
};

const getPaymentStatus = async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const payment = await PaymentService.getPaymentByOrderId(orderId);
  if (!payment) {
    return res.status(httpStatus.NOT_FOUND).json({ success: false, message: "Payment not found" });
  }

  // High-priority: ownership check
  const userId = (req.user as { _id?: string } | undefined)?._id;
  if (
    (req.user as { role?: string } | undefined)?.role !== "ADMIN" &&
    String(payment.userId) !== userId
  ) {
    return res.status(httpStatus.FORBIDDEN).json({ success: false, message: "Forbidden" });
  }

  res.status(httpStatus.OK).json({ success: true, data: payment });
};

export const PaymentController = {
  initPayment,
  handleSuccess,
  handleFail,
  handleCancel,
  handleIpn,
  getPaymentStatus,
};

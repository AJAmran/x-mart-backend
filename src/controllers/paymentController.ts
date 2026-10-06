import { Request, Response } from "express";
import { PaymentService } from "../services/paymentService";
import { OrderService } from "../services/orderService";
import httpStatus from "http-status";
import config from "../config";
import AppError from "../error/AppErros";
import { catchAsync } from "../utils/catchAsync";
import sendResponse from "../utils/sendResponse";
import { PaymentValidation } from "../validations/paymentValidation";

const initPayment = catchAsync(async (req: Request, res: Response) => {
  const { orderId } = req.body as { orderId: string; idempotencyKey?: string };
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
});

const handleSuccess = catchAsync(async (req: Request, res: Response) => {
  const { tranId } = req.params;
  // C-01 FIX is inside PaymentService.handleSuccess — it calls the gateway
  // validation API and refuses to mark the order paid if the call fails.
  const payment = await PaymentService.handleSuccess(tranId, req.body);
  const orderId = payment.orderId;
  res.redirect(
    `${config.clientUrl}/payment/success?tranId=${tranId}&orderId=${orderId}`
  );
});

const handleFail = catchAsync(async (req: Request, res: Response) => {
  const { tranId } = req.params;
  await PaymentService.handleFail(tranId, req.body);
  res.redirect(`${config.clientUrl}/payment/fail?tranId=${tranId}`);
});

const handleCancel = catchAsync(async (req: Request, res: Response) => {
  const { tranId } = req.params;
  await PaymentService.handleCancel(tranId);
  res.redirect(`${config.clientUrl}/payment/cancel?tranId=${tranId}`);
});

const handleIpn = catchAsync(async (req: Request, res: Response) => {
  const { tranId } = req.params;
  await PaymentService.handleIpn(tranId, req.body);
  res.status(httpStatus.OK).json({ success: true });
});

const getPaymentStatus = catchAsync(async (req: Request, res: Response) => {
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
});

const getUserPayments = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as { _id?: string } | undefined)?._id;
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User ID not found in token");
  }

  const { page, limit } = PaymentValidation.paginationSchema.parse(req.query);
  const result = await PaymentService.getUserPayments(String(userId), { page, limit });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payments fetched successfully",
    meta: result.meta,
    data: result.payments,
  });
});

const getPaymentDetails = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as { _id?: string } | undefined)?._id;
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User ID not found in token");
  }

  const { id } = PaymentValidation.paymentIdSchema.parse(req.params);
  const result = await PaymentService.getPaymentDetails(String(userId), id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment details fetched successfully",
    data: result,
  });
});

export const PaymentController = {
  initPayment,
  handleSuccess,
  handleFail,
  handleCancel,
  handleIpn,
  getPaymentStatus,
  getUserPayments,
  getPaymentDetails,
};

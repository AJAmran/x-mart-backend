import { Request, Response } from "express";
import { PaymentService } from "../services/paymentService";
import { OrderService } from "../services/orderService";
import httpStatus from "http-status";
import config from "../config";

const initPayment = async (req: Request, res: Response) => {
  const { orderId } = req.body;
  const userId = req.user?._id || req.user?.userId;

  const order = await OrderService.getOrderById(orderId);
  if (!order) {
    return res.status(httpStatus.NOT_FOUND).json({ success: false, message: "Order not found" });
  }

  const result = await PaymentService.initPayment(
    orderId,
    userId,
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

  return res.status(httpStatus.OK).json({
    success: true,
    message: "Payment initiated",
    data: result,
  });
};

const handleSuccess = async (req: Request, res: Response) => {
  const { tranId } = req.params;
  const payment = await PaymentService.handleSuccess(tranId, req.body);
  const orderId = payment.orderId;
  res.redirect(`${config.clientUrl}/payment/success?tranId=${tranId}&orderId=${orderId}`);
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
  return res.status(httpStatus.OK).json({ success: true, data: payment });
};

export const PaymentController = {
  initPayment,
  handleSuccess,
  handleFail,
  handleCancel,
  handleIpn,
  getPaymentStatus,
};

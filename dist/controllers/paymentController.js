"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const paymentService_1 = require("../services/paymentService");
const orderService_1 = require("../services/orderService");
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../config"));
const initPayment = async (req, res) => {
    const { orderId } = req.body;
    const userId = req.user?._id || req.user?.userId;
    const order = await orderService_1.OrderService.getOrderById(orderId);
    if (!order) {
        return res.status(http_status_1.default.NOT_FOUND).json({ success: false, message: "Order not found" });
    }
    const result = await paymentService_1.PaymentService.initPayment(orderId, userId, order.totalPrice, {
        name: order.shippingInfo.name,
        email: order.shippingInfo.email,
        phone: order.shippingInfo.phone,
        address: order.shippingInfo.addressLine1,
        city: order.shippingInfo.city,
        postalCode: order.shippingInfo.postalCode,
        division: order.shippingInfo.division,
    });
    return res.status(http_status_1.default.OK).json({
        success: true,
        message: "Payment initiated",
        data: result,
    });
};
const handleSuccess = async (req, res) => {
    const { tranId } = req.params;
    const payment = await paymentService_1.PaymentService.handleSuccess(tranId, req.body);
    const orderId = payment.orderId;
    res.redirect(`${config_1.default.clientUrl}/payment/success?tranId=${tranId}&orderId=${orderId}`);
};
const handleFail = async (req, res) => {
    const { tranId } = req.params;
    await paymentService_1.PaymentService.handleFail(tranId, req.body);
    res.redirect(`${config_1.default.clientUrl}/payment/fail?tranId=${tranId}`);
};
const handleCancel = async (req, res) => {
    const { tranId } = req.params;
    await paymentService_1.PaymentService.handleCancel(tranId);
    res.redirect(`${config_1.default.clientUrl}/payment/cancel?tranId=${tranId}`);
};
const handleIpn = async (req, res) => {
    const { tranId } = req.params;
    await paymentService_1.PaymentService.handleIpn(tranId, req.body);
    res.status(http_status_1.default.OK).json({ success: true });
};
const getPaymentStatus = async (req, res) => {
    const { orderId } = req.params;
    const payment = await paymentService_1.PaymentService.getPaymentByOrderId(orderId);
    if (!payment) {
        return res.status(http_status_1.default.NOT_FOUND).json({ success: false, message: "Payment not found" });
    }
    return res.status(http_status_1.default.OK).json({ success: true, data: payment });
};
exports.PaymentController = {
    initPayment,
    handleSuccess,
    handleFail,
    handleCancel,
    handleIpn,
    getPaymentStatus,
};
//# sourceMappingURL=paymentController.js.map
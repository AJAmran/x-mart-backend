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
const AppErros_1 = __importDefault(require("../error/AppErros"));
const isTrustedGatewayOrigin = (origin) => {
    if (!origin)
        return false;
    const trusted = [
        "https://securepay.sslcommerz.com",
        "https://sandbox.sslcommerz.com",
        "sandbox.sslcommerz.com",
        "securepay.sslcommerz.com",
    ];
    return trusted.some((host) => origin.includes(host));
};
const initPayment = async (req, res) => {
    const { orderId, idempotencyKey } = req.body;
    const userId = req.user?._id;
    const order = await orderService_1.OrderService.getOrderById(orderId);
    if (!order) {
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "Order not found");
    }
    // High-priority: A01 IDOR — users can only init payment for their own orders
    if (req.user?.role !== "ADMIN" &&
        String(order.userId) !== userId) {
        throw new AppErros_1.default(http_status_1.default.FORBIDDEN, "Not your order");
    }
    const result = await paymentService_1.PaymentService.initPayment(orderId, String(userId), order.totalPrice, {
        name: order.shippingInfo.name,
        email: order.shippingInfo.email,
        phone: order.shippingInfo.phone,
        address: order.shippingInfo.addressLine1,
        city: order.shippingInfo.city,
        postalCode: order.shippingInfo.postalCode,
        division: order.shippingInfo.division,
    });
    res.status(http_status_1.default.OK).json({
        success: true,
        message: result.idempotent ? "Payment session already in progress" : "Payment initiated",
        data: result,
    });
};
const handleSuccess = async (req, res) => {
    const { tranId } = req.params;
    // C-01 FIX is inside PaymentService.handleSuccess — it calls the gateway
    // validation API and refuses to mark the order paid if the call fails.
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
    // The IPN POST is allowed only from the gateway origin. Other callers get 403.
    const origin = (req.headers.origin || req.headers.referer);
    if (!isTrustedGatewayOrigin(origin)) {
        return res.status(http_status_1.default.FORBIDDEN).json({ success: false, message: "Forbidden" });
    }
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
    // High-priority: ownership check
    const userId = req.user?._id;
    if (req.user?.role !== "ADMIN" &&
        String(payment.userId) !== userId) {
        return res.status(http_status_1.default.FORBIDDEN).json({ success: false, message: "Forbidden" });
    }
    res.status(http_status_1.default.OK).json({ success: true, data: payment });
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
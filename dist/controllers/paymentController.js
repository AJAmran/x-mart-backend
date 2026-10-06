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
const catchAsync_1 = require("../utils/catchAsync");
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
const paymentValidation_1 = require("../validations/paymentValidation");
const initPayment = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { orderId } = req.body;
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
});
const handleSuccess = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { tranId } = req.params;
    // C-01 FIX is inside PaymentService.handleSuccess — it calls the gateway
    // validation API and refuses to mark the order paid if the call fails.
    const payment = await paymentService_1.PaymentService.handleSuccess(tranId, req.body);
    const orderId = payment.orderId;
    res.redirect(`${config_1.default.clientUrl}/payment/success?tranId=${tranId}&orderId=${orderId}`);
});
const handleFail = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { tranId } = req.params;
    await paymentService_1.PaymentService.handleFail(tranId, req.body);
    res.redirect(`${config_1.default.clientUrl}/payment/fail?tranId=${tranId}`);
});
const handleCancel = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { tranId } = req.params;
    await paymentService_1.PaymentService.handleCancel(tranId);
    res.redirect(`${config_1.default.clientUrl}/payment/cancel?tranId=${tranId}`);
});
const handleIpn = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { tranId } = req.params;
    await paymentService_1.PaymentService.handleIpn(tranId, req.body);
    res.status(http_status_1.default.OK).json({ success: true });
});
const getPaymentStatus = (0, catchAsync_1.catchAsync)(async (req, res) => {
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
});
const getUserPayments = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new AppErros_1.default(http_status_1.default.UNAUTHORIZED, "User ID not found in token");
    }
    const { page, limit } = paymentValidation_1.PaymentValidation.paginationSchema.parse(req.query);
    const result = await paymentService_1.PaymentService.getUserPayments(String(userId), { page, limit });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Payments fetched successfully",
        meta: result.meta,
        data: result.payments,
    });
});
const getPaymentDetails = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new AppErros_1.default(http_status_1.default.UNAUTHORIZED, "User ID not found in token");
    }
    const { id } = paymentValidation_1.PaymentValidation.paymentIdSchema.parse(req.params);
    const result = await paymentService_1.PaymentService.getPaymentDetails(String(userId), id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Payment details fetched successfully",
        data: result,
    });
});
exports.PaymentController = {
    initPayment,
    handleSuccess,
    handleFail,
    handleCancel,
    handleIpn,
    getPaymentStatus,
    getUserPayments,
    getPaymentDetails,
};
//# sourceMappingURL=paymentController.js.map
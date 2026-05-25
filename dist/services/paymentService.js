"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const sslcommerz_lts_1 = __importDefault(require("sslcommerz-lts"));
const http_status_1 = __importDefault(require("http-status"));
const AppErros_1 = __importDefault(require("../error/AppErros"));
const config_1 = __importDefault(require("../config"));
const Payment_1 = require("../models/Payment");
const Order_1 = require("../models/Order");
const orderInterface_1 = require("../interface/orderInterface");
const orderService_1 = require("./orderService");
const store_id = config_1.default.sslStoreId || "";
const store_passwd = config_1.default.sslStorePassword || "";
const isSandbox = config_1.default.nodeEnv === "development";
const sslcz = new sslcommerz_lts_1.default(store_id, store_passwd, isSandbox);
const initPayment = async (orderId, userId, amount, shippingInfo) => {
    const tranId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const payment = await Payment_1.Payment.create({
        orderId,
        userId,
        tranId,
        amount,
        status: "INITIATED",
    });
    const baseUrl = config_1.default.backendUrl;
    const clientUrl = config_1.default.clientUrl;
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
        await Payment_1.Payment.findByIdAndUpdate(payment._id, { status: "FAILED" });
        throw new AppErros_1.default(http_status_1.default.BAD_REQUEST, response.failedreason || "Payment initialization failed");
    }
    await Payment_1.Payment.findByIdAndUpdate(payment._id, {
        gatewayData: response,
    });
    return {
        GatewayPageURL: response.GatewayPageURL,
        tranId,
    };
};
const handleSuccess = async (tranId, gatewayData) => {
    const payment = await Payment_1.Payment.findOne({ tranId });
    if (!payment)
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "Payment not found");
    payment.status = "SUCCESS";
    payment.gatewayData = gatewayData;
    await payment.save();
    // Deduct stock since payment confirmed
    await orderService_1.OrderService.confirmPaymentAndDeductStock(payment.orderId);
    await Order_1.Order.findByIdAndUpdate(payment.orderId, {
        paymentMethod: "ONLINE",
        $push: {
            trackingHistory: {
                status: orderInterface_1.ORDER_STATUS.PENDING,
                updatedAt: new Date(),
                note: "Payment received via SSL Commerz",
            },
        },
    });
    return payment;
};
const handleFail = async (tranId, gatewayData) => {
    const payment = await Payment_1.Payment.findOne({ tranId });
    if (!payment)
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "Payment not found");
    payment.status = "FAILED";
    if (gatewayData)
        payment.gatewayData = gatewayData;
    await payment.save();
    await Order_1.Order.findByIdAndDelete(payment.orderId);
    return payment;
};
const handleCancel = async (tranId) => {
    const payment = await Payment_1.Payment.findOne({ tranId });
    if (!payment)
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "Payment not found");
    payment.status = "CANCELLED";
    await payment.save();
    await Order_1.Order.findByIdAndDelete(payment.orderId);
    return payment;
};
const handleIpn = async (tranId, gatewayData) => {
    const payment = await Payment_1.Payment.findOne({ tranId });
    if (!payment)
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "Payment not found");
    payment.gatewayData = gatewayData;
    if (gatewayData.status === "VALID") {
        payment.status = "SUCCESS";
        await Order_1.Order.findByIdAndUpdate(payment.orderId, {
            paymentMethod: "ONLINE",
        });
    }
    else if (gatewayData.status === "FAILED") {
        payment.status = "FAILED";
    }
    await payment.save();
    return payment;
};
const getPaymentByOrderId = async (orderId) => {
    return await Payment_1.Payment.findOne({ orderId });
};
exports.PaymentService = {
    initPayment,
    handleSuccess,
    handleFail,
    handleCancel,
    handleIpn,
    getPaymentByOrderId,
};
//# sourceMappingURL=paymentService.js.map
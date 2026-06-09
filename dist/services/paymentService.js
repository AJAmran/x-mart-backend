"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const node_crypto_1 = require("node:crypto");
const sslcommerz_lts_1 = __importDefault(require("sslcommerz-lts"));
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = __importDefault(require("mongoose"));
const AppErros_1 = __importDefault(require("../error/AppErros"));
const config_1 = __importDefault(require("../config"));
const Payment_1 = require("../models/Payment");
const Order_1 = require("../models/Order");
const Product_1 = require("../models/Product");
const orderInterface_1 = require("../interface/orderInterface");
const store_id = config_1.default.sslStoreId ?? "";
const store_passwd = config_1.default.sslStorePassword ?? "";
const isSandbox = config_1.default.nodeEnv === "development";
const sslcz = new sslcommerz_lts_1.default(store_id, store_passwd, isSandbox);
const TERMINAL_STATUSES = ["SUCCESS", "FAILED", "CANCELLED"];
const initPayment = async (orderId, userId, amount, shippingInfo) => {
    // ── C-02 FIX: idempotency. Re-init for the same order returns the existing
    // pending payment instead of creating a new one. This kills double-charge
    // and orphan-payment races that the previous implementation allowed.
    const existing = await Payment_1.Payment.findOne({
        orderId,
        status: { $nin: TERMINAL_STATUSES },
    }).sort({ createdAt: -1 });
    if (existing && existing.gatewayData?.GatewayPageURL) {
        return {
            GatewayPageURL: existing.gatewayData.GatewayPageURL,
            tranId: existing.tranId,
            idempotent: true,
        };
    }
    // cryptographically-strong, collision-free transaction id
    const tranId = `TXN-${(0, node_crypto_1.randomUUID)()}`;
    const payment = await Payment_1.Payment.create({
        orderId,
        userId,
        tranId,
        amount,
        status: "INITIATED",
    });
    const baseUrl = config_1.default.backendUrl;
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
        throw new AppErros_1.default(http_status_1.default.BAD_REQUEST, response.failedreason ?? "Payment initialization failed");
    }
    await Payment_1.Payment.findByIdAndUpdate(payment._id, { gatewayData: response });
    return { GatewayPageURL: response.GatewayPageURL, tranId, idempotent: false };
};
const validateWithGateway = async (tranId, gatewayPayload) => {
    // The IPN and success redirects both post data that we MUST verify against
    // the gateway before mutating state. Without this call the client can mark
    // any order as paid just by visiting the success URL.
    const val_id = gatewayPayload?.val_id ?? tranId;
    try {
        const result = await sslcz.validate({ val_id });
        const statuses = (result?.data ?? []).map((d) => d.status);
        const ok = result?.status === "VALID" || statuses.includes("VALID") || statuses.includes("VALIDATED");
        return Boolean(ok);
    }
    catch (err) {
        return false;
    }
};
const deductStockAtomically = async (orderId) => {
    // Mongo session/transaction. Requires a replica set (M10+).
    const session = await mongoose_1.default.startSession();
    try {
        await session.withTransaction(async () => {
            const order = await Order_1.Order.findById(orderId).session(session);
            if (!order)
                throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "Order not found");
            if (order.stockDeducted)
                return; // idempotent
            for (const item of order.items) {
                const remaining = item.quantity;
                // Atomic conditional update on the first branch inventory with enough stock.
                // If the product has no inventories array, fall back to the scalar `stock` field.
                const updated = await Product_1.Product.findOneAndUpdate({
                    _id: item.productId,
                    "inventories.0.stock": { $gte: remaining },
                }, { $inc: { "inventories.$[].stock": -remaining, stock: -remaining } }, { session, new: true });
                if (!updated) {
                    throw new AppErros_1.default(http_status_1.default.BAD_REQUEST, `${item.name} does not have enough stock available`);
                }
            }
            await Order_1.Order.findByIdAndUpdate(orderId, { stockDeducted: true }, { session });
        });
    }
    finally {
        await session.endSession();
    }
};
const restoreStockAtomically = async (orderId) => {
    const session = await mongoose_1.default.startSession();
    try {
        await session.withTransaction(async () => {
            const order = await Order_1.Order.findById(orderId).session(session);
            if (!order)
                return;
            if (!order.stockDeducted)
                return; // nothing to restore
            for (const item of order.items) {
                await Product_1.Product.findByIdAndUpdate(item.productId, { $inc: { "inventories.$[].stock": item.quantity, stock: item.quantity } }, { session });
            }
            await Order_1.Order.findByIdAndUpdate(orderId, { stockDeducted: false }, { session });
        });
    }
    finally {
        await session.endSession();
    }
};
const handleSuccess = async (tranId, gatewayData) => {
    // C-01 FIX: never trust the redirect. Verify with the gateway first.
    const verified = await validateWithGateway(tranId, gatewayData);
    if (!verified) {
        throw new AppErros_1.default(http_status_1.default.BAD_REQUEST, "Payment could not be verified with the gateway");
    }
    const payment = await Payment_1.Payment.findOne({ tranId });
    if (!payment)
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "Payment not found");
    if (payment.status === "SUCCESS")
        return payment; // idempotent
    payment.status = "SUCCESS";
    payment.gatewayData = gatewayData;
    await payment.save();
    await deductStockAtomically(payment.orderId.toString());
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
    if (payment.status === "FAILED")
        return payment;
    payment.status = "FAILED";
    if (gatewayData)
        payment.gatewayData = gatewayData;
    await payment.save();
    // High-priority fix: if we already deducted stock, restore it.
    await restoreStockAtomically(payment.orderId.toString());
    await Order_1.Order.findByIdAndDelete(payment.orderId);
    return payment;
};
const handleCancel = async (tranId) => {
    const payment = await Payment_1.Payment.findOne({ tranId });
    if (!payment)
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "Payment not found");
    if (payment.status === "CANCELLED")
        return payment;
    payment.status = "CANCELLED";
    await payment.save();
    await restoreStockAtomically(payment.orderId.toString());
    await Order_1.Order.findByIdAndDelete(payment.orderId);
    return payment;
};
const handleIpn = async (tranId, gatewayData) => {
    // IPN is the gateway's authoritative callback. Verify before mutating.
    const verified = await validateWithGateway(tranId, gatewayData);
    if (!verified) {
        throw new AppErros_1.default(http_status_1.default.BAD_REQUEST, "IPN signature invalid");
    }
    const payment = await Payment_1.Payment.findOne({ tranId });
    if (!payment)
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "Payment not found");
    if (payment.status === "SUCCESS")
        return payment;
    payment.gatewayData = gatewayData;
    payment.status = "SUCCESS";
    await payment.save();
    await deductStockAtomically(payment.orderId.toString());
    await Order_1.Order.findByIdAndUpdate(payment.orderId, { paymentMethod: "ONLINE" });
    return payment;
};
const getPaymentByOrderId = async (orderId) => {
    return Payment_1.Payment.findOne({ orderId });
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
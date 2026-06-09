"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = __importStar(require("mongoose"));
const AppErros_1 = __importDefault(require("../error/AppErros"));
const orderInterface_1 = require("../interface/orderInterface");
const Product_1 = require("../models/Product");
const Order_1 = require("../models/Order");
// ── Helper: atomic stock deduction (single transaction) ───────────────────
const deductStockForOrder = async (orderId) => {
    const session = await mongoose_1.default.startSession();
    try {
        await session.withTransaction(async () => {
            const order = await Order_1.Order.findById(orderId).session(session);
            if (!order)
                throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "Order not found");
            if (order.stockDeducted)
                return;
            for (const item of order.items) {
                const productId = new mongoose_1.Types.ObjectId(String(item.productId));
                const updated = await Product_1.Product.findOneAndUpdate({
                    _id: productId,
                    $or: [
                        { "inventories.0.stock": { $gte: item.quantity } },
                        { stock: { $gte: item.quantity } },
                    ],
                }, [
                    {
                        $set: {
                            inventories: {
                                $map: {
                                    input: "$inventories",
                                    as: "inv",
                                    in: {
                                        $mergeObjects: [
                                            "$$inv",
                                            {
                                                $cond: [
                                                    { $gt: ["$$inv.stock", 0] },
                                                    {
                                                        $let: {
                                                            vars: {
                                                                deduct: {
                                                                    $min: ["$$inv.stock", item.quantity],
                                                                },
                                                            },
                                                            in: {
                                                                stock: { $subtract: ["$$inv.stock", "$$deduct"] },
                                                            },
                                                        },
                                                    },
                                                    "$$inv",
                                                ],
                                            },
                                        ],
                                    },
                                },
                            },
                        },
                    },
                ], { session, new: true }).lean();
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
const restoreStockForOrder = async (orderId) => {
    const session = await mongoose_1.default.startSession();
    try {
        await session.withTransaction(async () => {
            const order = await Order_1.Order.findById(orderId).session(session);
            if (!order || !order.stockDeducted)
                return;
            for (const item of order.items) {
                await Product_1.Product.findByIdAndUpdate(new mongoose_1.Types.ObjectId(String(item.productId)), { $inc: { "inventories.$[].stock": item.quantity, stock: item.quantity } }, { session });
            }
            await Order_1.Order.findByIdAndUpdate(orderId, { stockDeducted: false }, { session });
        });
    }
    finally {
        await session.endSession();
    }
};
// ── Create order ──────────────────────────────────────────────────────────
const createOrder = async (userId, payload) => {
    if (!payload.items?.length) {
        throw new AppErros_1.default(http_status_1.default.BAD_REQUEST, "Your cart is empty. Add at least one item before placing an order");
    }
    // Idempotency: if the client retries with the same key, return the existing order.
    if (payload.idempotencyKey) {
        const existing = await Order_1.Order.findOne({ idempotencyKey: payload.idempotencyKey });
        if (existing)
            return existing;
    }
    // C-05 FIX: batch the product lookup, no more N+1
    const productIds = payload.items.map((i) => new mongoose_1.Types.ObjectId(String(i.productId)));
    const products = await Product_1.Product.find({ _id: { $in: productIds } }).lean();
    const productById = new Map(products.map((p) => [String(p._id), p]));
    for (const item of payload.items) {
        const product = productById.get(String(item.productId));
        if (!product) {
            throw new AppErros_1.default(http_status_1.default.NOT_FOUND, `${item.name ?? "One item in your cart"} is no longer available`);
        }
        const totalStock = (product.stock ?? 0) ||
            (product.inventories?.reduce((s, inv) => s + inv.stock, 0) ?? 0);
        if (totalStock < item.quantity) {
            throw new AppErros_1.default(http_status_1.default.BAD_REQUEST, `Only ${totalStock} unit${totalStock === 1 ? "" : "s"} of ${product.name} available`);
        }
    }
    const totalPrice = payload.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const isOnlinePayment = payload.paymentMethod === "ONLINE";
    // COD: deduct stock now. Online: deduct later on payment success (in PaymentService).
    let orderDoc;
    const session = await mongoose_1.default.startSession();
    try {
        await session.withTransaction(async () => {
            const created = await Order_1.Order.create([
                {
                    userId: new mongoose_1.Types.ObjectId(userId),
                    items: payload.items,
                    shippingInfo: payload.shippingInfo,
                    totalPrice,
                    paymentMethod: payload.paymentMethod,
                    status: orderInterface_1.ORDER_STATUS.PENDING,
                    idempotencyKey: payload.idempotencyKey,
                    stockDeducted: !isOnlinePayment,
                    trackingHistory: [
                        {
                            status: orderInterface_1.ORDER_STATUS.PENDING,
                            updatedAt: new Date(),
                            note: isOnlinePayment ? "Awaiting payment" : "Order placed",
                        },
                    ],
                },
            ], { session });
            orderDoc = created[0];
            if (!isOnlinePayment) {
                for (const item of payload.items) {
                    const updated = await Product_1.Product.findOneAndUpdate({
                        _id: new mongoose_1.Types.ObjectId(String(item.productId)),
                        $or: [
                            { "inventories.0.stock": { $gte: item.quantity } },
                            { stock: { $gte: item.quantity } },
                        ],
                    }, { $inc: { "inventories.$[].stock": -item.quantity, stock: -item.quantity } }, { session, new: true });
                    if (!updated) {
                        throw new AppErros_1.default(http_status_1.default.BAD_REQUEST, `${item.name} ran out of stock while placing your order`);
                    }
                }
            }
        });
    }
    finally {
        await session.endSession();
    }
    return orderDoc;
};
// ── Read paths ────────────────────────────────────────────────────────────
const getAllOrders = async (filters, options) => {
    const { page, limit, sortBy, sortOrder } = options;
    const skip = (page - 1) * limit;
    const query = {};
    if (filters.status)
        query.status = filters.status;
    if (filters.userId)
        query.userId = new mongoose_1.Types.ObjectId(filters.userId);
    const [data, total] = await Promise.all([
        Order_1.Order.find(query).sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 }).skip(skip).limit(limit).lean(),
        Order_1.Order.countDocuments(query),
    ]);
    return {
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        data,
    };
};
const getOrderById = async (id) => {
    const result = await Order_1.Order.findById(id).lean();
    if (!result)
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "Order not found");
    return result;
};
const getUserOrders = async (userId) => {
    return Order_1.Order.find({ userId: new mongoose_1.Types.ObjectId(userId) }).sort({ createdAt: -1 }).lean();
};
// ── Status mutations ──────────────────────────────────────────────────────
const updateOrderStatus = async (id, status, note) => {
    const order = await Order_1.Order.findById(id);
    if (!order)
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "Order not found");
    if (order.status === orderInterface_1.ORDER_STATUS.CANCELLED ||
        order.status === orderInterface_1.ORDER_STATUS.DELIVERED) {
        throw new AppErros_1.default(http_status_1.default.BAD_REQUEST, `Cannot update status of ${order.status.toLowerCase()} order`);
    }
    const result = await Order_1.Order.findByIdAndUpdate(id, {
        status,
        $push: {
            trackingHistory: { status, updatedAt: new Date(), note },
        },
    }, { new: true }).lean();
    if (status === orderInterface_1.ORDER_STATUS.CANCELLED) {
        await restoreStockForOrder(id);
    }
    return result;
};
const cancelOrder = async (id, userId) => {
    const order = await Order_1.Order.findById(id);
    if (!order)
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "Order not found");
    if (String(order.userId) !== String(userId)) {
        throw new AppErros_1.default(http_status_1.default.FORBIDDEN, "Unauthorized to cancel this order");
    }
    if (order.status === orderInterface_1.ORDER_STATUS.DELIVERED) {
        throw new AppErros_1.default(http_status_1.default.BAD_REQUEST, "Delivered orders cannot be cancelled");
    }
    if (order.status === orderInterface_1.ORDER_STATUS.CANCELLED) {
        throw new AppErros_1.default(http_status_1.default.BAD_REQUEST, "This order has already been cancelled");
    }
    return updateOrderStatus(id, orderInterface_1.ORDER_STATUS.CANCELLED, "Cancelled by user");
};
exports.OrderService = {
    createOrder,
    confirmPaymentAndDeductStock: (id) => deductStockForOrder(id),
    getAllOrders,
    getOrderById,
    getUserOrders,
    updateOrderStatus,
    cancelOrder,
};
//# sourceMappingURL=orderService.js.map
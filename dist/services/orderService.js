"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppErros_1 = __importDefault(require("../error/AppErros"));
const orderInterface_1 = require("../interface/orderInterface");
const Product_1 = require("../models/Product");
const Order_1 = require("../models/Order");
const createOrder = async (userId, payload) => {
    // Validate stock availability
    for (const item of payload.items) {
        const product = await Product_1.Product.findById(item.productId);
        if (!product) {
            throw new AppErros_1.default(http_status_1.default.NOT_FOUND, `Product ${item.name} not found`);
        }
        if (product.stock < item.quantity) {
            throw new AppErros_1.default(http_status_1.default.BAD_REQUEST, `Insufficient stock for ${item.name}`);
        }
    }
    // Calculate total price
    const totalPrice = payload.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    // Create order
    const order = await Order_1.Order.create({
        userId,
        items: payload.items,
        shippingInfo: payload.shippingInfo,
        totalPrice,
        paymentMethod: payload.paymentMethod,
        status: orderInterface_1.ORDER_STATUS.PENDING,
        trackingHistory: [
            {
                status: orderInterface_1.ORDER_STATUS.PENDING,
                updatedAt: new Date(),
                note: "Order placed",
            },
        ],
    });
    // Update stock
    for (const item of payload.items) {
        await Product_1.Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: -item.quantity },
        });
    }
    return order;
};
const getAllOrders = async (filters, options) => {
    const { page, limit, sortBy, sortOrder } = options;
    const skip = (page - 1) * limit;
    const sortCriteria = {
        [sortBy]: sortOrder === "desc" ? -1 : 1,
    };
    const result = await Order_1.Order.find(filters)
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit);
    const total = await Order_1.Order.countDocuments(filters);
    const totalPages = Math.ceil(total / limit);
    return {
        meta: {
            page,
            limit,
            total,
            totalPages,
        },
        data: result,
    };
};
const getOrderById = async (id) => {
    const result = await Order_1.Order.findById(id);
    if (!result) {
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "Order not found");
    }
    return result;
};
const getUserOrders = async (userId) => {
    const result = await Order_1.Order.find({ userId }).sort({ createdAt: -1 });
    return result;
};
const updateOrderStatus = async (id, status, note) => {
    const order = await Order_1.Order.findById(id);
    if (!order) {
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "Order not found");
    }
    // Prevent updating cancelled or delivered orders
    if (order.status === orderInterface_1.ORDER_STATUS.CANCELLED ||
        order.status === orderInterface_1.ORDER_STATUS.DELIVERED) {
        throw new AppErros_1.default(http_status_1.default.BAD_REQUEST, `Cannot update status of ${order.status.toLowerCase()} order`);
    }
    const trackingEntry = {
        status,
        updatedAt: new Date(),
        note,
    };
    const result = await Order_1.Order.findByIdAndUpdate(id, {
        status,
        $push: { trackingHistory: trackingEntry },
    }, { new: true });
    // If order is cancelled, restore stock
    if (status === orderInterface_1.ORDER_STATUS.CANCELLED) {
        for (const item of order.items) {
            await Product_1.Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: item.quantity },
            });
        }
    }
    return result;
};
const cancelOrder = async (id, userId) => {
    const order = await Order_1.Order.findById(id);
    if (!order) {
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "Order not found");
    }
    if (order.userId !== userId) {
        throw new AppErros_1.default(http_status_1.default.FORBIDDEN, "Unauthorized to cancel this order");
    }
    return updateOrderStatus(id, orderInterface_1.ORDER_STATUS.CANCELLED, "Cancelled by user");
};
exports.OrderService = {
    createOrder,
    getAllOrders,
    getOrderById,
    getUserOrders,
    updateOrderStatus,
    cancelOrder,
};
//# sourceMappingURL=orderService.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRepository = exports.OrderRepository = void 0;
const Order_1 = require("../models/Order");
class OrderRepository {
    async findAll(filters, options) {
        const { page, limit, sortBy, sortOrder } = options;
        const query = {};
        if (filters.status)
            query.status = filters.status;
        if (filters.userId)
            query.userId = filters.userId;
        const [data, total] = await Promise.all([
            Order_1.Order.find(query)
                .sort({ [sortBy]: sortOrder })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Order_1.Order.countDocuments(query),
        ]);
        return {
            data,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async findById(id) {
        return Order_1.Order.findById(id).lean();
    }
    async findByUserId(userId) {
        return Order_1.Order.find({ userId }).sort({ createdAt: -1 }).lean();
    }
    async create(data) {
        const doc = await Order_1.Order.create(data);
        return doc.toObject();
    }
    async updateStatus(id, status, trackingEntry) {
        return Order_1.Order.findByIdAndUpdate(id, { status, $push: { trackingHistory: trackingEntry } }, { new: true }).lean();
    }
}
exports.OrderRepository = OrderRepository;
exports.orderRepository = new OrderRepository();
//# sourceMappingURL=order.repository.js.map
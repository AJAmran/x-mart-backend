import { FilterQuery, SortOrder } from "mongoose";
import { Order } from "../models/Order";
import { TOrder } from "../interface/orderInterface";

export interface OrderFilters {
  status?: string;
  userId?: string;
}

export class OrderRepository {
  async findAll(
    filters: OrderFilters,
    options: { page: number; limit: number; sortBy: string; sortOrder: SortOrder }
  ): Promise<{ data: TOrder[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const { page, limit, sortBy, sortOrder } = options;
    const query: FilterQuery<TOrder> = {};

    if (filters.status) query.status = filters.status;
    if (filters.userId) query.userId = filters.userId;

    const [data, total] = await Promise.all([
      Order.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string): Promise<TOrder | null> {
    return Order.findById(id).lean();
  }

  async findByUserId(userId: string): Promise<TOrder[]> {
    return Order.find({ userId }).sort({ createdAt: -1 }).lean();
  }

  async create(data: Partial<TOrder>): Promise<TOrder> {
    const doc = await Order.create(data);
    return doc.toObject();
  }

  async updateStatus(
    id: string,
    status: string,
    trackingEntry: any
  ): Promise<TOrder | null> {
    return Order.findByIdAndUpdate(
      id,
      { status, $push: { trackingHistory: trackingEntry } },
      { new: true }
    ).lean();
  }
}

export const orderRepository = new OrderRepository();

import httpStatus from "http-status";
import AppError from "../error/AppErros";
import { ORDER_STATUS, TOrder } from "../interface/orderInterface";
import { Product } from "../models/Product";
import { Order } from "../models/Order";

const createOrder = async (userId: string, payload: Partial<TOrder>) => {
  // Validate stock availability
  for (const item of payload.items!) {
    const product = await Product.findById(item.productId);
    if (!product) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        `Product ${item.name} not found`
      );
    }
    if (product.stock < item.quantity) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Insufficient stock for ${item.name}`
      );
    }
  }

  // Calculate total price
  const totalPrice = payload.items!.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  // Create order
  const order = await Order.create({
    userId,
    items: payload.items,
    shippingInfo: payload.shippingInfo,
    totalPrice,
    paymentMethod: payload.paymentMethod,
    status: ORDER_STATUS.PENDING,
    trackingHistory: [
      {
        status: ORDER_STATUS.PENDING,
        updatedAt: new Date(),
        note: "Order placed",
      },
    ],
  });

  // Update stock
  for (const item of payload.items!) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: -item.quantity },
    });
  }

  return order;
};

const getAllOrders = async (filters: any, options: any) => {
  const { page, limit, sortBy, sortOrder } = options;

  const skip = (page - 1) * limit;
  const sortCriteria: { [key: string]: 1 | -1 } = {
    [sortBy]: sortOrder === "desc" ? -1 : 1,
  };

  const result = await Order.find(filters)
    .sort(sortCriteria)
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(filters);
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

const getOrderById = async (id: string) => {
  const result = await Order.findById(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }
  return result;
};

const getUserOrders = async (userId: string) => {
  const result = await Order.find({ userId }).sort({ createdAt: -1 });
  return result;
};

const updateOrderStatus = async (
  id: string,
  status: keyof typeof ORDER_STATUS,
  note?: string
) => {
  const order = await Order.findById(id);
  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  // Prevent updating cancelled or delivered orders
  if (
    order.status === ORDER_STATUS.CANCELLED ||
    order.status === ORDER_STATUS.DELIVERED
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot update status of ${order.status.toLowerCase()} order`
    );
  }

  const trackingEntry = {
    status,
    updatedAt: new Date(),
    note,
  };

  const result = await Order.findByIdAndUpdate(
    id,
    {
      status,
      $push: { trackingHistory: trackingEntry },
    },
    { new: true }
  );

  // If order is cancelled, restore stock
  if (status === ORDER_STATUS.CANCELLED) {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }
  }

  return result;
};

const cancelOrder = async (id: string, userId: string) => {
  const order = await Order.findById(id);
  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }
  if (order.userId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Unauthorized to cancel this order"
    );
  }
  return updateOrderStatus(id, ORDER_STATUS.CANCELLED, "Cancelled by user");
};

export const OrderService = {
  createOrder,
  getAllOrders,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  cancelOrder,
};

import { Request, Response } from "express";
import Order from "../models/Order";
import { successResponse, errorResponse } from "../utils/responseHandler";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { user, products, paymentDetails, shippingAddress } = req.body;

    const totalPrice = products.reduce(
      (sum: number, item: { quantity: number; price: number }) =>
        sum + item.quantity * item.price,
      0
    );

    const order = await Order.create({
      user,
      products,
      totalPrice,
      paymentDetails,
      shippingAddress,
    });

    successResponse(res, order, "Order created successfully", 201);
  } catch (error) {
    errorResponse(res, error);
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, userId } = req.query;

    const query: any = {};
    if (userId) query.user = userId;

    const orders = await Order.find(query)
      .populate("user", "name email")
      .populate("products.product", "name price")
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const totalOrders = await Order.countDocuments(query);

    successResponse(res, { orders, totalOrders }, "Orders retrieved successfully");
  } catch (error) {
    errorResponse(res, error);
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate("user", "name email")
      .populate("products.product", "name price");

    if (!order) {
      return errorResponse(res, "Order not found", 404);
    }

    successResponse(res, order, "Order retrieved successfully");
  } catch (error) {
    errorResponse(res, error);
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("user", "name email");

    if (!order) {
      return errorResponse(res, "Order not found", 404);
    }

    successResponse(res, order, "Order status updated successfully");
  } catch (error) {
    errorResponse(res, error);
  }
};

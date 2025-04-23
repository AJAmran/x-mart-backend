import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../utils/catchAsync";
import { OrderService } from "../services/orderService";
import sendResponse from "../utils/sendResponse";

import AppError from "../error/AppErros";

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id; // Changed from req.user?.id to req.user?._id
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User ID not found in token");
  }
  const orderData = req.body;
  const result = await OrderService.createOrder(userId, orderData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Order created successfully",
    data: result,
  });
});

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const {
    status,
    userId,
    page = "1",
    limit = "10",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const filters: any = {};
  if (status) filters.status = (status as string).toUpperCase();
  if (userId) filters.userId = userId;

  const options = {
    page: parseInt(page as string),
    limit: parseInt(limit as string),
    sortBy,
    sortOrder,
  };

  const result = await OrderService.getAllOrders(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Orders fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await OrderService.getOrderById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order fetched successfully",
    data: result,
  });
});

const getUserOrders = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id; // Changed from req.user?.id to req.user?._id
  const result = await OrderService.getUserOrders(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User orders fetched successfully",
    data: result,
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, note } = req.body;
  const result = await OrderService.updateOrderStatus(id, status, note);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order status updated successfully",
    data: result,
  });
});

const cancelOrder = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?._id; // Changed from req.user?.id to req.user?._id
  const result = await OrderService.cancelOrder(id, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order cancelled successfully",
    data: result,
  });
});

export const OrderControllers = {
  createOrder,
  getAllOrders,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  cancelOrder,
};

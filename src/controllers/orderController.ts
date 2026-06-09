import { Request, Response } from "express";
import { Types } from "mongoose";
import httpStatus from "http-status";
import { catchAsync } from "../utils/catchAsync";
import { OrderService } from "../services/orderService";
import sendResponse from "../utils/sendResponse";
import AppError from "../error/AppErros";

const validateObjectId = (id: string, label = "id") => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, `Invalid ${label}`);
  }
};

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as { _id?: string } | undefined)?._id;
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User ID not found in token");
  }
  const result = await OrderService.createOrder(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Order created successfully",
    data: result,
  });
});

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const { status, userId, page = "1", limit = "10", sortBy = "createdAt", sortOrder = "desc" } = req.query;

  const filters: { status?: string; userId?: string } = {};
  if (status) filters.status = (status as string).toUpperCase();
  if (userId) filters.userId = userId as string;

  const options = {
    page: parseInt(page as string, 10),
    limit: parseInt(limit as string, 10),
    sortBy: sortBy as string,
    sortOrder: sortOrder as "asc" | "desc",
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
  validateObjectId(id, "order id");
  const result = await OrderService.getOrderById(id);

  // High-priority: A01 IDOR — non-admins can only fetch their own orders.
  const role = (req.user as { role?: string } | undefined)?.role;
  const userId = (req.user as { _id?: string } | undefined)?._id;
  if (role !== "ADMIN" && String((result as { userId: Types.ObjectId }).userId) !== userId) {
    return sendResponse(res, {
      statusCode: httpStatus.FORBIDDEN,
      success: false,
      message: "You are not authorized to view this order",
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order fetched successfully",
    data: result,
  });
});

const getUserOrders = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as { _id?: string } | undefined)?._id;
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User ID not found in token");
  }
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
  validateObjectId(id, "order id");
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
  validateObjectId(id, "order id");
  const userId = (req.user as { _id?: string } | undefined)?._id;
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User ID not found in token");
  }
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

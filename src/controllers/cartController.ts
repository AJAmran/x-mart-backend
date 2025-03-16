import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { CartService } from "../services/cartService";
import sendResponse from "../utils/sendResponse";
import httpStatus from "http-status";

const getCart = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const cart = await CartService.getCartByUserId(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cart fetched successfully",
    data: cart,
  });
});

const updateCart = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { items } = req.body;
  const cart = await CartService.createOrUpdateCart(userId, items);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cart updated successfully",
    data: cart,
  });
});

const deleteCart = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const cart = await CartService.deleteCart(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cart deleted successfully",
    data: cart,
  });
});

export const CartController = {
  getCart,
  updateCart,
  deleteCart,
};
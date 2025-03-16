import AppError from "../error/AppErros";
import { TCartItem } from "../interface/cartInterface";
import { Cart } from "../models/Cart";
import httpStatus from "http-status";

const getCartByUserId = async (userId: string) => {
  return await Cart.findOne({ userId }).populate("items.productId");
};

const createOrUpdateCart = async (userId: string, items: TCartItem[]) => {
  const cart = await Cart.findOne({ userId });

  if (cart) {
    cart.items = items;
    cart.totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
    cart.totalPrice = items.reduce(
      (acc, item) => acc + item.quantity * item.price,
      0
    );
    await cart.save();
    return cart;
  } else {
    const newCart = await Cart.create({
      userId,
      items,
      totalItems: items.reduce((acc, item) => acc + item.quantity, 0),
      totalPrice: items.reduce(
        (acc, item) => acc + item.quantity * item.price,
        0
      ),
    });
    return newCart;
  }
};

const deleteCart = async (userId: string) => {
  const cart = await Cart.findOneAndDelete({ userId });
  if (!cart) {
    throw new AppError(httpStatus.NOT_FOUND, "Cart not found");
  }
  return cart;
};

export const CartService ={
    getCartByUserId,
    createOrUpdateCart,
    deleteCart,
}
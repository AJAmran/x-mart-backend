import httpStatus from "http-status";
import mongoose, { Types } from "mongoose";
import AppError from "../error/AppErros";
import { ORDER_STATUS, TOrder, TOrderItem } from "../interface/orderInterface";
import { Product } from "../models/Product";
import { Branch } from "../models/Branch";
import { Order } from "../models/Order";
import { resolveProductStock } from "../utils/stock";

// ── Helper: atomic stock deduction (single transaction) ───────────────────
const deductStockForOrder = async (orderId: Types.ObjectId | string) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const order = await Order.findById(orderId).session(session);
      if (!order) throw new AppError(httpStatus.NOT_FOUND, "Order not found");
      if (order.stockDeducted) return;

      for (const item of order.items as TOrderItem[]) {
        const productId = new Types.ObjectId(String(item.productId));
        const updated = await Product.findOneAndUpdate(
          {
            _id: productId,
            $or: [
              { "inventories.0.stock": { $gte: item.quantity } },
              { stock: { $gte: item.quantity } },
            ],
          },
          [
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
          ],
          { session, new: true }
        ).lean();

        if (!updated) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            `${item.name} does not have enough stock available`
          );
        }
      }

      await Order.findByIdAndUpdate(orderId, { stockDeducted: true }, { session });
    });
  } finally {
    await session.endSession();
  }
};

const restoreStockForOrder = async (orderId: Types.ObjectId | string) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const order = await Order.findById(orderId).session(session);
      if (!order || !order.stockDeducted) return;

      for (const item of order.items as TOrderItem[]) {
        await Product.findByIdAndUpdate(
          new Types.ObjectId(String(item.productId)),
          { $inc: { "inventories.$[].stock": item.quantity, stock: item.quantity } },
          { session }
        );
      }

      await Order.findByIdAndUpdate(orderId, { stockDeducted: false }, { session });
    });
  } finally {
    await session.endSession();
  }
};

// ── Create order ──────────────────────────────────────────────────────────
const createOrder = async (userId: string, payload: Partial<TOrder>) => {
  if (!payload.items?.length) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Your cart is empty. Add at least one item before placing an order"
    );
  }

  // Idempotency: if the client retries with the same key, return the existing order.
  if (payload.idempotencyKey) {
    const existing = await Order.findOne({ idempotencyKey: payload.idempotencyKey });
    if (existing) return existing;
  }

  // C-05 FIX: batch the product lookup, no more N+1
  const productIds = payload.items.map((i) => new Types.ObjectId(String(i.productId)));
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const productById = new Map(products.map((p) => [String(p._id), p]));

  for (const item of payload.items) {
    const product = productById.get(String(item.productId));
    if (!product) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        `${item.name ?? "One item in your cart"} is no longer available`
      );
    }
    const totalStock = resolveProductStock(product);
    if (totalStock < item.quantity) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        totalStock === 0
          ? `${product.name} is out of stock`
          : `Only ${totalStock} unit${totalStock === 1 ? "" : "s"} of ${product.name} available`
      );
    }
  }

  const totalPrice = payload.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const isOnlinePayment = payload.paymentMethod === "ONLINE";

  // Reject a branch that does not exist, rather than storing a dangling ref.
  let branchObjectId: Types.ObjectId | undefined;

  if (payload.branchId) {
    const exists = await Branch.exists({ _id: payload.branchId });

    if (!exists) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "The selected fulfillment branch no longer exists"
      );
    }

    branchObjectId = new Types.ObjectId(String(payload.branchId));
  }

  // COD: deduct stock now. Online: deduct later on payment success (in PaymentService).
  let orderDoc;
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const created = await Order.create(
        [
          {
            userId: new Types.ObjectId(userId),
            items: payload.items,
            shippingInfo: payload.shippingInfo,
            totalPrice,
            branchId: branchObjectId,
            paymentMethod: payload.paymentMethod,
            status: ORDER_STATUS.PENDING,
            idempotencyKey: payload.idempotencyKey,
            stockDeducted: !isOnlinePayment,
            trackingHistory: [
              {
                status: ORDER_STATUS.PENDING,
                updatedAt: new Date(),
                note: isOnlinePayment ? "Awaiting payment" : "Order placed",
              },
            ],
          },
        ],
        { session }
      );
      orderDoc = created[0];

      if (!isOnlinePayment) {
        for (const item of payload.items as TOrderItem[]) {
          /**
           * Only the per-branch `inventories` rows are decremented.
           *
           * The previous update also did `$inc: { stock: -qty }` on the
           * denormalised aggregate. Because that field is frequently 0 or
           * absent, the increment *created* it as a negative number, and
           * Mongoose does not validate `findOneAndUpdate` unless
           * `runValidators` is set — so the `min: 0` on the schema never fired.
           * Every later read then returned that negative value and the product
           * could never be ordered again.
           *
           * `resolveProductStock` now derives the authoritative figure from
           * these branch rows, so leaving `stock` untouched is safe.
           */
          const product = await Product.findById(
            new Types.ObjectId(String(item.productId))
          ).session(session);

          if (!product) {
            throw new AppError(
              httpStatus.NOT_FOUND,
              `${item.name ?? "An item in your cart"} is no longer available`
            );
          }

          const available = resolveProductStock(product);
          if (available < item.quantity) {
            throw new AppError(
              httpStatus.BAD_REQUEST,
              available === 0
                ? `${item.name ?? product.name} is out of stock`
                : `Only ${available} unit${available === 1 ? "" : "s"} of ${product.name} available`
            );
          }

          await Product.updateOne(
            { _id: product._id },
            { $inc: { "inventories.$[].stock": -item.quantity } },
            { session }
          );
        }
      }
    });
  } finally {
    await session.endSession();
  }

  return orderDoc;
};

// ── Read paths ────────────────────────────────────────────────────────────
const getAllOrders = async (filters: { status?: string; userId?: string }, options: {
  page: number; limit: number; sortBy: string; sortOrder: "asc" | "desc";
}) => {
  const { page, limit, sortBy, sortOrder } = options;
  const skip = (page - 1) * limit;
  const query: Record<string, unknown> = {};
  if (filters.status) query.status = filters.status;
  if (filters.userId) query.userId = new Types.ObjectId(filters.userId);

  const [data, total] = await Promise.all([
    Order.find(query).sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(query),
  ]);

  return {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data,
  };
};

const getOrderById = async (id: string) => {
  const result = await Order.findById(id).lean();
  if (!result) throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  return result;
};

const getUserOrders = async (userId: string) => {
  return Order.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).lean();
};

// ── Status mutations ──────────────────────────────────────────────────────
const updateOrderStatus = async (
  id: string,
  status: keyof typeof ORDER_STATUS,
  note?: string
) => {
  const order = await Order.findById(id);
  if (!order) throw new AppError(httpStatus.NOT_FOUND, "Order not found");

  if (
    order.status === ORDER_STATUS.CANCELLED ||
    order.status === ORDER_STATUS.DELIVERED
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot update status of ${order.status.toLowerCase()} order`
    );
  }

  const result = await Order.findByIdAndUpdate(
    id,
    {
      status,
      $push: {
        trackingHistory: { status, updatedAt: new Date(), note },
      },
    },
    { new: true }
  ).lean();

  if (status === ORDER_STATUS.CANCELLED) {
    await restoreStockForOrder(id);
  }

  return result;
};

const cancelOrder = async (id: string, userId: string) => {
  const order = await Order.findById(id);
  if (!order) throw new AppError(httpStatus.NOT_FOUND, "Order not found");

  if (String(order.userId) !== String(userId)) {
    throw new AppError(httpStatus.FORBIDDEN, "Unauthorized to cancel this order");
  }

  if (order.status === ORDER_STATUS.DELIVERED) {
    throw new AppError(httpStatus.BAD_REQUEST, "Delivered orders cannot be cancelled");
  }
  if (order.status === ORDER_STATUS.CANCELLED) {
    throw new AppError(httpStatus.BAD_REQUEST, "This order has already been cancelled");
  }

  return updateOrderStatus(id, ORDER_STATUS.CANCELLED, "Cancelled by user");
};

export const OrderService = {
  createOrder,
  confirmPaymentAndDeductStock: (id: string) => deductStockForOrder(id),
  getAllOrders,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  cancelOrder,
};

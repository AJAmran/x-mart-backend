import express from "express";
import auth from "../middleware/authMiddleware";
import { USER_ROLE } from "../constants/userConstant";
import validateRequest from "../middleware/validateRequest";
import { OrderValidation } from "../validations/orderValidation";
import { OrderControllers } from "../controllers/orderController";

const router = express.Router();

// Create order (Authenticated users)
router.post(
  "/",
  auth(USER_ROLE.USER),
  validateRequest(OrderValidation.createOrderValidationSchema),
  OrderControllers.createOrder
);

// Get user orders (Authenticated users) - Moved before /:id
router.get("/my-orders", auth(USER_ROLE.USER), OrderControllers.getUserOrders);

// Get order by ID (Admin or order owner)
router.get(
  "/:id",
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  OrderControllers.getOrderById
);

// Get all orders (Admin only)
router.get("/", auth(USER_ROLE.ADMIN), OrderControllers.getAllOrders);

// Update order status (Admin only)
router.patch(
  "/:id/status",
  auth(USER_ROLE.ADMIN),
  validateRequest(OrderValidation.updateOrderStatusValidationSchema),
  OrderControllers.updateOrderStatus
);

// Cancel order (Order owner)
router.patch("/:id/cancel", auth(USER_ROLE.USER), OrderControllers.cancelOrder);

export default router;

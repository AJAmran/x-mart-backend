import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/orderController";

import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "../validations/orderValidation";
import { validateRequest } from "../middleware/validateRequest";

const router = express.Router();

router.post("/", validateRequest(createOrderSchema), createOrder);
router.get("/", getOrders);
router.get("/:id", getOrderById);
router.put("/:id", validateRequest(updateOrderStatusSchema), updateOrderStatus);

export default router;

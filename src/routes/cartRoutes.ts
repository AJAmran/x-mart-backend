
import express from "express";
import { z } from "zod";

import { USER_ROLE } from "../constants/userConstant";
import { CartController } from "../controllers/cartController";
import auth from "../middleware/authMiddleware";
import validateRequest from "../middleware/validateRequest";

const router = express.Router();

/**
 * `POST /cart` replaces the entire cart, so the client must always send the
 * full `items` array. Without this guard a malformed body reached
 * `createOrUpdateCart(userId, undefined)` and surfaced as a 500, which tells
 * the caller "our fault" when it is their payload that is wrong.
 */
const updateCartValidationSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          productId: z.string().min(1, { message: "Product ID is required" }),
          quantity: z.number().int().min(1, { message: "Quantity must be at least 1" }),
          price: z.number().min(0, { message: "Price cannot be negative" }),
          name: z.string().min(1, { message: "Product name is required" }),
          image: z.string().url({ message: "Invalid image URL" }),
        })
      )
      .max(200, { message: "A cart cannot hold more than 200 line items" }),
  }),
});

router.get("/", auth(USER_ROLE.USER), CartController.getCart);
router.post(
  "/",
  auth(USER_ROLE.USER),
  validateRequest(updateCartValidationSchema),
  CartController.updateCart
);
router.delete("/", auth(USER_ROLE.USER), CartController.deleteCart);

export default router;
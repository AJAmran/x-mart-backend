
import express from "express";
import { USER_ROLE } from "../constants/userConstant";
import { CartController } from "../controllers/cartController";
import auth from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", auth(USER_ROLE.USER), CartController.getCart);
router.post("/", auth(USER_ROLE.USER), CartController.updateCart);
router.delete("/", auth(USER_ROLE.USER), CartController.deleteCart);

export default router;
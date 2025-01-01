import express from "express";
import {
  registerUser,
  loginUser,
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  deleteUser,
} from "../controllers/userController";

import { registerSchema, loginSchema } from "../validations/userValidation";
import { authMiddleware, adminMiddleware } from "../middlewares/authMiddleware";
import { validateRequest } from "../middleware/validateRequest";

const router = express.Router();

router.post("/register", validateRequest(registerSchema), registerUser);
router.post("/login", validateRequest(loginSchema), loginUser);

router.get("/", authMiddleware, adminMiddleware, getAllUsers);
router.get("/:id", authMiddleware, getUserProfile);
router.put("/:id", authMiddleware, updateUserProfile);
router.delete("/:id", authMiddleware, adminMiddleware, deleteUser);

export default router;

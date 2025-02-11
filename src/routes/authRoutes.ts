import express from "express";
import validateRequest from "../middleware/validateRequest";
import { AuthValidation } from "../validations/authValidation";
import { AuthControllers } from "../controllers/authController";

const router = express.Router();

router.post(
  "/register",
  validateRequest(AuthValidation.registerValidationSchema),
  AuthControllers.registeruser
);

router.post(
  "/login",
  validateRequest(AuthValidation.loginValidationSchema),
  AuthControllers.loginUser
);

export default router;

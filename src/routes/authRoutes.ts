import express from "express";
import validateRequest, {
  validateRequestCookies,
} from "../middleware/validateRequest";
import { AuthValidation } from "../validations/authValidation";
import { AuthControllers } from "../controllers/authController";
import auth from "../middleware/authMiddleware";
import { USER_ROLE } from "../constants/userConstant";

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

router.post(
  "/change-password",
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  validateRequest(AuthValidation.changePasswordValidationSchema),
  AuthControllers.changePassword
);

router.post(
  "/change-password",
  validateRequestCookies(AuthValidation.refreshTokenValidationSchema),
  AuthControllers.refreshToken
);

export default router;

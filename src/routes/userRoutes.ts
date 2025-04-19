import express from "express";
import validateRequest from "../middleware/validateRequest";
import { UserValidation } from "../validations/userValidation";
import { UserControllers } from "../controllers/userController";
import auth from "../middleware/authMiddleware";
import { USER_ROLE } from "../constants/userConstant";

const router = express.Router();

router.get("/", auth(USER_ROLE.ADMIN), UserControllers.getAllUsers);

router.get(
  "/:id",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  UserControllers.getUserById
);

router.patch(
  "/:id",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  validateRequest(UserValidation.updateUserValidationSchema),
  UserControllers.updateUser
);

router.delete("/:id", auth(USER_ROLE.ADMIN), UserControllers.deleteUser);

router.patch(
  "/:id/status",
  auth(USER_ROLE.ADMIN),
  validateRequest(UserValidation.updateStatusValidationSchema),
  UserControllers.updateUserStatus
);

router.patch(
  "/:id/role",
  auth(USER_ROLE.ADMIN),
  validateRequest(UserValidation.updateRoleValidationSchema),
  UserControllers.updateUserRole
);

export default router;

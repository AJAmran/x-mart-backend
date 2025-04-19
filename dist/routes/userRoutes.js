"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../middleware/validateRequest"));
const userValidation_1 = require("../validations/userValidation");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const userConstant_1 = require("../constants/userConstant");
const router = express_1.default.Router();
router.get("/", (0, authMiddleware_1.default)(userConstant_1.USER_ROLE.ADMIN), userController_1.UserControllers.getAllUsers);
router.get("/:id", (0, authMiddleware_1.default)(userConstant_1.USER_ROLE.ADMIN, userConstant_1.USER_ROLE.USER), userController_1.UserControllers.getUserById);
router.patch("/:id", (0, authMiddleware_1.default)(userConstant_1.USER_ROLE.ADMIN, userConstant_1.USER_ROLE.USER), (0, validateRequest_1.default)(userValidation_1.UserValidation.updateUserValidationSchema), userController_1.UserControllers.updateUser);
router.delete("/:id", (0, authMiddleware_1.default)(userConstant_1.USER_ROLE.ADMIN), userController_1.UserControllers.deleteUser);
router.patch("/:id/status", (0, authMiddleware_1.default)(userConstant_1.USER_ROLE.ADMIN), (0, validateRequest_1.default)(userValidation_1.UserValidation.updateStatusValidationSchema), userController_1.UserControllers.updateUserStatus);
router.patch("/:id/role", (0, authMiddleware_1.default)(userConstant_1.USER_ROLE.ADMIN), (0, validateRequest_1.default)(userValidation_1.UserValidation.updateRoleValidationSchema), userController_1.UserControllers.updateUserRole);
exports.default = router;

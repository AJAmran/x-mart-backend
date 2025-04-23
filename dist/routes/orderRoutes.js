"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const userConstant_1 = require("../constants/userConstant");
const validateRequest_1 = __importDefault(require("../middleware/validateRequest"));
const orderValidation_1 = require("../validations/orderValidation");
const orderController_1 = require("../controllers/orderController");
const router = express_1.default.Router();
// Create order (Authenticated users)
router.post("/", (0, authMiddleware_1.default)(userConstant_1.USER_ROLE.USER), (0, validateRequest_1.default)(orderValidation_1.OrderValidation.createOrderValidationSchema), orderController_1.OrderControllers.createOrder);
// Get user orders (Authenticated users) - Moved before /:id
router.get("/my-orders", (0, authMiddleware_1.default)(userConstant_1.USER_ROLE.USER), orderController_1.OrderControllers.getUserOrders);
// Get order by ID (Admin or order owner)
router.get("/:id", (0, authMiddleware_1.default)(userConstant_1.USER_ROLE.USER, userConstant_1.USER_ROLE.ADMIN), orderController_1.OrderControllers.getOrderById);
// Get all orders (Admin only)
router.get("/", (0, authMiddleware_1.default)(userConstant_1.USER_ROLE.ADMIN), orderController_1.OrderControllers.getAllOrders);
// Update order status (Admin only)
router.patch("/:id/status", (0, authMiddleware_1.default)(userConstant_1.USER_ROLE.ADMIN), (0, validateRequest_1.default)(orderValidation_1.OrderValidation.updateOrderStatusValidationSchema), orderController_1.OrderControllers.updateOrderStatus);
// Cancel order (Order owner)
router.patch("/:id/cancel", (0, authMiddleware_1.default)(userConstant_1.USER_ROLE.USER), orderController_1.OrderControllers.cancelOrder);
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userConstant_1 = require("../constants/userConstant");
const paymentController_1 = require("../controllers/paymentController");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = express_1.default.Router();
router.post("/init", (0, authMiddleware_1.default)(userConstant_1.USER_ROLE.USER), paymentController_1.PaymentController.initPayment);
router.post("/success/:tranId", paymentController_1.PaymentController.handleSuccess);
router.post("/fail/:tranId", paymentController_1.PaymentController.handleFail);
router.post("/cancel/:tranId", paymentController_1.PaymentController.handleCancel);
router.post("/ipn/:tranId", paymentController_1.PaymentController.handleIpn);
router.get("/status/:orderId", (0, authMiddleware_1.default)(userConstant_1.USER_ROLE.USER), paymentController_1.PaymentController.getPaymentStatus);
exports.default = router;
//# sourceMappingURL=paymentRoutes.js.map
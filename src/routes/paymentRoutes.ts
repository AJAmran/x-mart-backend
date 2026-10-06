import express from "express";
import { USER_ROLE } from "../constants/userConstant";
import { PaymentController } from "../controllers/paymentController";
import auth from "../middleware/authMiddleware";

const router = express.Router();

router.post("/init", auth(USER_ROLE.USER), PaymentController.initPayment);
router.post("/success/:tranId", PaymentController.handleSuccess);
router.post("/fail/:tranId", PaymentController.handleFail);
router.post("/cancel/:tranId", PaymentController.handleCancel);
router.post("/ipn/:tranId", PaymentController.handleIpn);
router.get("/status/:orderId", auth(USER_ROLE.USER), PaymentController.getPaymentStatus);
router.get("/", auth(USER_ROLE.USER), PaymentController.getUserPayments);
router.get("/:id", auth(USER_ROLE.USER), PaymentController.getPaymentDetails);

export default router;

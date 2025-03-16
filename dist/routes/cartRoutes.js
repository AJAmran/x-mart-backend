"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userConstant_1 = require("../constants/userConstant");
const cartController_1 = require("../controllers/cartController");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = express_1.default.Router();
router.get("/", (0, authMiddleware_1.default)(userConstant_1.USER_ROLE.USER), cartController_1.CartController.getCart);
router.post("/", (0, authMiddleware_1.default)(userConstant_1.USER_ROLE.USER), cartController_1.CartController.updateCart);
router.delete("/", (0, authMiddleware_1.default)(userConstant_1.USER_ROLE.USER), cartController_1.CartController.deleteCart);
exports.default = router;

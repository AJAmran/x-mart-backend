"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const userConstant_1 = require("../constants/userConstant");
const cartController_1 = require("../controllers/cartController");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const validateRequest_1 = __importDefault(require("../middleware/validateRequest"));
const router = express_1.default.Router();
/**
 * `POST /cart` replaces the entire cart, so the client must always send the
 * full `items` array. Without this guard a malformed body reached
 * `createOrUpdateCart(userId, undefined)` and surfaced as a 500, which tells
 * the caller "our fault" when it is their payload that is wrong.
 */
const updateCartValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        items: zod_1.z
            .array(zod_1.z.object({
            productId: zod_1.z.string().min(1, { message: "Product ID is required" }),
            quantity: zod_1.z.number().int().min(1, { message: "Quantity must be at least 1" }),
            price: zod_1.z.number().min(0, { message: "Price cannot be negative" }),
            name: zod_1.z.string().min(1, { message: "Product name is required" }),
            image: zod_1.z.string().url({ message: "Invalid image URL" }),
        }))
            .max(200, { message: "A cart cannot hold more than 200 line items" }),
    }),
});
router.get("/", (0, authMiddleware_1.default)(userConstant_1.USER_ROLE.USER), cartController_1.CartController.getCart);
router.post("/", (0, authMiddleware_1.default)(userConstant_1.USER_ROLE.USER), (0, validateRequest_1.default)(updateCartValidationSchema), cartController_1.CartController.updateCart);
router.delete("/", (0, authMiddleware_1.default)(userConstant_1.USER_ROLE.USER), cartController_1.CartController.deleteCart);
exports.default = router;
//# sourceMappingURL=cartRoutes.js.map
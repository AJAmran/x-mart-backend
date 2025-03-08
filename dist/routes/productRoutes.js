"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userConstant_1 = require("../constants/userConstant");
const productController_1 = require("../controllers/productController");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const validateRequest_1 = __importDefault(require("../middleware/validateRequest"));
const productValidation_1 = require("../validations/productValidation");
const router = express_1.default.Router();
// Product CRUD
router.post("/", (0, authMiddleware_1.default)(userConstant_1.USER_ROLE.ADMIN), (0, validateRequest_1.default)(productValidation_1.ProductValidation.createProductValidationSchema), productController_1.ProductControllers.createProduct);
router.get("/", productController_1.ProductControllers.getAllProducts);
router.get("/:id", productController_1.ProductControllers.getProductById);
router.patch("/:id", (0, authMiddleware_1.default)(userConstant_1.USER_ROLE.ADMIN), (0, validateRequest_1.default)(productValidation_1.ProductValidation.updateProductValidationSchema), productController_1.ProductControllers.updateProduct);
router.delete("/:id", (0, authMiddleware_1.default)(userConstant_1.USER_ROLE.ADMIN), productController_1.ProductControllers.deleteProduct);
// Inventory Management
router.patch("/:id/update-stock", (0, authMiddleware_1.default)(userConstant_1.USER_ROLE.ADMIN), (0, validateRequest_1.default)(productValidation_1.ProductValidation.updateProductValidationSchema), productController_1.ProductControllers.updateStock);
// Discount Management
router.post("/:id/apply-discount", (0, authMiddleware_1.default)(userConstant_1.USER_ROLE.ADMIN), (0, validateRequest_1.default)(productValidation_1.ProductValidation.createProductValidationSchema), productController_1.ProductControllers.applyDiscount);
router.delete("/:id/remove-discount", (0, authMiddleware_1.default)(userConstant_1.USER_ROLE.ADMIN), productController_1.ProductControllers.removeDiscount);
exports.default = router;

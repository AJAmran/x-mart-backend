import express from "express";
import { USER_ROLE } from "../constants/userConstant";
import { ProductControllers } from "../controllers/productController";
import auth from "../middleware/authMiddleware";
import validateRequest from "../middleware/validateRequest";
import { ProductValidation } from "../validations/productValidation";


const router = express.Router();

// Product CRUD
router.post(
  "/",
  auth(USER_ROLE.ADMIN),
  validateRequest(ProductValidation.createProductValidationSchema),
  ProductControllers.createProduct
);

router.get("/", ProductControllers.getAllProducts);

router.get("/:id", ProductControllers.getProductById);

router.patch(
  "/:id",
  auth(USER_ROLE.ADMIN),
  validateRequest(ProductValidation.updateProductValidationSchema),
  ProductControllers.updateProduct
);

router.delete("/:id", auth(USER_ROLE.ADMIN), ProductControllers.deleteProduct);

// Inventory Management
router.patch(
  "/:id/update-stock",
  auth(USER_ROLE.ADMIN),
  validateRequest(ProductValidation.updateProductValidationSchema),
  ProductControllers.updateStock
);

// Discount Management
router.post(
  "/:id/apply-discount",
  auth(USER_ROLE.ADMIN),
  validateRequest(ProductValidation.createProductValidationSchema),
  ProductControllers.applyDiscount
);

router.delete(
  "/:id/remove-discount",
  auth(USER_ROLE.ADMIN),
  ProductControllers.removeDiscount
);

export default router;
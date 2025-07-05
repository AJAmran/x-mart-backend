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

// Advanced filtering
router.get("/search/advanced", ProductControllers.advancedProductSearch);

// Branch-specific operations
router.get(
  "/:branchId",
  validateRequest(ProductValidation.branchSpecificSchema),
  ProductControllers.getProductsByBranch
);

router.patch(
  "/:id/update-stock",
  auth(USER_ROLE.ADMIN),
  validateRequest(ProductValidation.updateStockValidationSchema),
  ProductControllers.updateStock
);

// Discount Management
router.post(
  "/:id/apply-discount",
  auth(USER_ROLE.ADMIN),
  validateRequest(ProductValidation.applyDiscountValidationSchema),
  ProductControllers.applyDiscount
);

router.delete(
  "/:id/remove-discount",
  auth(USER_ROLE.ADMIN),
  ProductControllers.removeDiscount
);

// Category operations
router.get("/categories/main", ProductControllers.getMainCategories);
router.get("/categories/sub", ProductControllers.getSubCategories);

export default router;
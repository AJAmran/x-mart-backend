import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
} from "../controllers/productController";
import {
  createProductSchema,
  updateProductSchema,
  bulkDeleteProductsSchema,
} from "../validations/productValidation";
import { validateRequest } from "../middleware/validateRequest";

const router = express.Router();

router.post("/", validateRequest(createProductSchema), createProduct);
router.get("/", getProducts);
router.get("/:id", validateRequest(updateProductSchema), getProductById);
router.put("/:id", validateRequest(updateProductSchema), updateProduct);
router.delete("/:id", validateRequest(updateProductSchema), deleteProduct);
router.post(
  "/bulk-delete",
  validateRequest(bulkDeleteProductsSchema),
  bulkDeleteProducts
);

export default router;

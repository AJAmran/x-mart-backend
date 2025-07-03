import express from "express";
import { USER_ROLE } from "../constants/userConstant";
import { BranchControllers } from "../controllers/branchController";
import auth from "../middleware/authMiddleware";
import validateRequest from "../middleware/validateRequest";
import { BranchValidation } from "../validations/branchValidation";

const router = express.Router();

// Branch CRUD operations
router.post(
  "/",
  auth(USER_ROLE.ADMIN),
  validateRequest(BranchValidation.createBranchValidationSchema),
  BranchControllers.createBranch
);

router.get("/", BranchControllers.getAllBranches);

router.get("/:id", BranchControllers.getBranchById);

router.patch(
  "/:id",
  auth(USER_ROLE.ADMIN),
  validateRequest(BranchValidation.updateBranchValidationSchema),
  BranchControllers.updateBranch
);

router.delete(
  "/:id",
  auth(USER_ROLE.ADMIN),
  BranchControllers.deleteBranch
);

// Special branch operations
router.get(
  "/nearby/locations",
  validateRequest(BranchValidation.nearbyBranchesValidationSchema),
  BranchControllers.getNearbyBranches
);

router.get("/:id/products", BranchControllers.getBranchProducts);

router.get("/:id/staff", auth(USER_ROLE.ADMIN), BranchControllers.getBranchStaff);

router.get("/types/available", BranchControllers.getBranchTypes);

router.get("/status/available", BranchControllers.getBranchStatuses);

export default router;
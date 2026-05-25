"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userConstant_1 = require("../constants/userConstant");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const validateRequest_1 = __importDefault(require("../middleware/validateRequest"));
const branchValidation_1 = require("../validations/branchValidation");
const branchController_1 = require("../controllers/branchController");
const router = express_1.default.Router();
// Branch CRUD operations
router.post("/", (0, authMiddleware_1.default)(userConstant_1.USER_ROLE.ADMIN), (0, validateRequest_1.default)(branchValidation_1.BranchValidation.createBranchValidationSchema), branchController_1.BranchControllers.createBranch);
router.get("/", branchController_1.BranchControllers.getAllBranches);
router.get("/:id", branchController_1.BranchControllers.getBranchById);
router.patch("/:id", (0, authMiddleware_1.default)(userConstant_1.USER_ROLE.ADMIN), (0, validateRequest_1.default)(branchValidation_1.BranchValidation.updateBranchValidationSchema), branchController_1.BranchControllers.updateBranch);
router.delete("/:id", (0, authMiddleware_1.default)(userConstant_1.USER_ROLE.ADMIN), branchController_1.BranchControllers.deleteBranch);
// Special branch operations
router.get("/nearby/locations", (0, validateRequest_1.default)(branchValidation_1.BranchValidation.nearbyBranchesValidationSchema), branchController_1.BranchControllers.getNearbyBranches);
router.get("/:id/products", branchController_1.BranchControllers.getBranchProducts);
router.get("/:id/staff", (0, authMiddleware_1.default)(userConstant_1.USER_ROLE.ADMIN), branchController_1.BranchControllers.getBranchStaff);
router.get("/types/available", branchController_1.BranchControllers.getBranchTypes);
router.get("/status/available", branchController_1.BranchControllers.getBranchStatuses);
exports.default = router;
//# sourceMappingURL=branchRoutes.js.map
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importStar(require("../middleware/validateRequest"));
const authValidation_1 = require("../validations/authValidation");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const userConstant_1 = require("../constants/userConstant");
const router = express_1.default.Router();
router.post("/register", (0, validateRequest_1.default)(authValidation_1.AuthValidation.registerValidationSchema), authController_1.AuthControllers.registerUser);
router.post("/login", (0, validateRequest_1.default)(authValidation_1.AuthValidation.loginValidationSchema), authController_1.AuthControllers.loginUser);
router.post("/change-password", (0, authMiddleware_1.default)(userConstant_1.USER_ROLE.USER, userConstant_1.USER_ROLE.ADMIN), (0, validateRequest_1.default)(authValidation_1.AuthValidation.changePasswordValidationSchema), authController_1.AuthControllers.changePassword);
router.post("/refresh-token", (0, validateRequest_1.validateRequestCookies)(authValidation_1.AuthValidation.refreshTokenValidationSchema), authController_1.AuthControllers.refreshToken);
exports.default = router;

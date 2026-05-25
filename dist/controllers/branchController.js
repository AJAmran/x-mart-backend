"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchControllers = void 0;
const catchAsync_1 = require("../utils/catchAsync");
const branchService_1 = require("../services/branchService");
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const pick_1 = __importDefault(require("../utils/pick"));
const createBranch = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const branchData = req.body;
    const result = await branchService_1.BranchService.createBranch(branchData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Branch created successfully",
        data: result,
    });
});
const getAllBranches = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const filters = (0, pick_1.default)(req.query, [
        "searchTerm",
        "status",
        "type",
        "city",
        "state",
    ]);
    const options = (0, pick_1.default)(req.query, ["sortBy", "sortOrder", "limit", "page"]);
    const result = await branchService_1.BranchService.getAllBranches(filters, options);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Branches fetched successfully",
        meta: result.meta,
        data: result.data,
    });
});
const getBranchById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const result = await branchService_1.BranchService.getBranchById(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Branch fetched successfully",
        data: result,
    });
});
const updateBranch = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const payload = req.body;
    const result = await branchService_1.BranchService.updateBranch(id, payload);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Branch updated successfully",
        data: result,
    });
});
const deleteBranch = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const result = await branchService_1.BranchService.deleteBranch(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Branch deleted successfully",
        data: result,
    });
});
const getNearbyBranches = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { lat, lng, maxDistance, limit } = req.query;
    const result = await branchService_1.BranchService.getNearbyBranches(Number(lat), Number(lng), Number(maxDistance), Number(limit));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Nearby branches fetched successfully",
        data: result,
    });
});
const getBranchProducts = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const filters = (0, pick_1.default)(req.query, [
        "searchTerm",
        "category",
        "status",
        "minPrice",
        "maxPrice",
    ]);
    const options = (0, pick_1.default)(req.query, ["sortBy", "sortOrder", "limit", "page"]);
    const result = await branchService_1.BranchService.getBranchProducts(id, filters, options);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Branch products fetched successfully",
        meta: result.meta,
        data: result.data,
    });
});
const getBranchStaff = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const result = await branchService_1.BranchService.getBranchStaff(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Branch staff fetched successfully",
        data: result,
    });
});
const getBranchTypes = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await branchService_1.BranchService.getBranchTypes();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Branch types fetched successfully",
        data: result,
    });
});
const getBranchStatuses = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await branchService_1.BranchService.getBranchStatuses();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Branch statuses fetched successfully",
        data: result,
    });
});
exports.BranchControllers = {
    createBranch,
    getAllBranches,
    getBranchById,
    updateBranch,
    deleteBranch,
    getNearbyBranches,
    getBranchProducts,
    getBranchStaff,
    getBranchTypes,
    getBranchStatuses,
};
//# sourceMappingURL=branchController.js.map
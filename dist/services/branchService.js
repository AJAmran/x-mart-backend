"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
const http_status_1 = __importDefault(require("http-status"));
const Branch_1 = require("../models/Branch");
const paginationHelpers_1 = require("../utils/paginationHelpers");
const Product_1 = require("../models/Product");
const AppErros_1 = __importDefault(require("../error/AppErros"));
const branchConstant_1 = require("../constants/branchConstant");
const createBranch = async (payload) => {
    // Check if branch code already exists
    const existingBranch = await Branch_1.Branch.findOne({ code: payload.code });
    if (existingBranch) {
        throw new AppErros_1.default(http_status_1.default.BAD_REQUEST, "Branch with this code already exists");
    }
    // Validate operating hours
    if (!payload.operatingHours || payload.operatingHours.length === 0) {
        throw new AppErros_1.default(http_status_1.default.BAD_REQUEST, "At least one operating hours entry is required");
    }
    const result = await Branch_1.Branch.create(payload);
    return result;
};
const getAllBranches = async (filters, options) => {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelpers_1.paginationHelpers.calculatePagination(options);
    const andConditions = [];
    // Search term filter
    if (filters.searchTerm) {
        andConditions.push({
            $or: [
                { name: { $regex: filters.searchTerm, $options: 'i' } },
                { code: { $regex: filters.searchTerm, $options: 'i' } },
                { 'location.city': { $regex: filters.searchTerm, $options: 'i' } },
                { 'location.state': { $regex: filters.searchTerm, $options: 'i' } }
            ]
        });
    }
    // Other filters
    if (filters.status) {
        andConditions.push({ status: filters.status });
    }
    if (filters.type) {
        andConditions.push({ type: filters.type });
    }
    if (filters.city) {
        andConditions.push({ 'location.city': filters.city });
    }
    if (filters.state) {
        andConditions.push({ 'location.state': filters.state });
    }
    const whereConditions = andConditions.length > 0 ? { $and: andConditions } : {};
    const result = await Branch_1.Branch.find(whereConditions)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit);
    const total = await Branch_1.Branch.countDocuments(whereConditions);
    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        data: result,
    };
};
const getBranchById = async (id) => {
    const result = await Branch_1.Branch.findById(id);
    if (!result) {
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "Branch not found");
    }
    return result;
};
const updateBranch = async (id, payload) => {
    const result = await Branch_1.Branch.findByIdAndUpdate(id, payload, { new: true });
    if (!result) {
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "Branch not found");
    }
    return result;
};
const deleteBranch = async (id) => {
    const result = await Branch_1.Branch.findByIdAndDelete(id);
    if (!result) {
        throw new AppErros_1.default(http_status_1.default.NOT_FOUND, "Branch not found");
    }
    // Soft delete - unassign any products associated with this branch
    await Product_1.Product.updateMany({}, { $pull: { images: id } });
    return result;
};
const getNearbyBranches = async (lat, lng, maxDistance, limit) => {
    const result = await Branch_1.Branch.find({
        "location.coordinates": {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [lng, lat]
                },
                $maxDistance: maxDistance * 1000 // Convert km to meters
            }
        },
        status: "ACTIVE"
    }).limit(limit);
    return result;
};
const getBranchProducts = async (branchId, filters, options) => {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelpers_1.paginationHelpers.calculatePagination(options);
    // Requires `availableBranches` to be stored as ObjectId — run
    // `npm run migrate:branch-refs` after re-seeding, otherwise Mongoose casts the
    // id and only ALL_BRANCHES products match.
    const andConditions = [
        {
            $or: [
                { availability: 'ALL_BRANCHES' },
                { availableBranches: branchId },
            ],
        },
    ];
    // Add other filters
    if (filters.searchTerm) {
        andConditions.push({
            $or: [
                { name: { $regex: filters.searchTerm, $options: 'i' } },
                { description: { $regex: filters.searchTerm, $options: 'i' } }
            ]
        });
    }
    if (filters.category) {
        andConditions.push({ category: filters.category });
    }
    if (filters.status) {
        andConditions.push({ status: filters.status });
    }
    if (filters.minPrice || filters.maxPrice) {
        const priceCondition = {};
        if (filters.minPrice)
            priceCondition.$gte = Number(filters.minPrice);
        if (filters.maxPrice)
            priceCondition.$lte = Number(filters.maxPrice);
        andConditions.push({ price: priceCondition });
    }
    const whereConditions = { $and: andConditions };
    const result = await Product_1.Product.find(whereConditions)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit);
    const total = await Product_1.Product.countDocuments(whereConditions);
    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        data: result,
    };
};
const getBranchStaff = async (branchId) => {
    // In a real application, you would query your User/Staff model
    // This is a placeholder implementation
    return [];
};
const getBranchTypes = async () => {
    return Object.keys(branchConstant_1.BRANCH_TYPE);
};
const getBranchStatuses = async () => {
    return Object.keys(branchConstant_1.BRANCH_STATUS);
};
exports.BranchService = {
    createBranch,
    getAllBranches,
    getBranchById,
    updateBranch,
    deleteBranch,
    getNearbyBranches,
    getBranchProducts,
    getBranchStaff,
    getBranchTypes,
    getBranchStatuses
};
//# sourceMappingURL=branchService.js.map
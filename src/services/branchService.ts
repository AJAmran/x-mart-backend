/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import httpStatus from "http-status";
import { BranchFilters, PaginationOptions, TBranch } from "../interface/branchInterface";
import { Branch } from "../models/Branch";
import { FilterQuery } from "mongoose";
import { paginationHelpers } from "../utils/paginationHelpers";
import { Product } from "../models/Product";
import AppError from "../error/AppErros";
import { BRANCH_STATUS, BRANCH_TYPE } from "../constants/branchConstant";

const createBranch = async (payload: TBranch) => {
  // Check if branch code already exists
  const existingBranch = await Branch.findOne({ code: payload.code });
  if (existingBranch) {
    throw new AppError(httpStatus.BAD_REQUEST, "Branch with this code already exists");
  }

  // Validate operating hours
  if (!payload.operatingHours || payload.operatingHours.length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "At least one operating hours entry is required");
  }

  const result = await Branch.create(payload);
  return result;
};



const getAllBranches = async (filters: BranchFilters, options: PaginationOptions) => {
  const { limit, page, skip, sortBy, sortOrder } = paginationHelpers.calculatePagination(options);
  
  const andConditions: FilterQuery<TBranch>[] = [];
  
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
  
  const whereConditions: FilterQuery<TBranch> = andConditions.length > 0 ? { $and: andConditions } : {};
  
  const result = await Branch.find(whereConditions)
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);
  
  const total = await Branch.countDocuments(whereConditions);
  
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

const getBranchById = async (id: string) => {
  const result = await Branch.findById(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Branch not found");
  }
  return result;
};

const updateBranch = async (id: string, payload: Partial<TBranch>) => {
  const result = await Branch.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Branch not found");
  }
  return result;
};

const deleteBranch = async (id: string) => {
  const result = await Branch.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Branch not found");
  }
  
  // Remove this branch from any products that have it in availableBranches
  await Product.updateMany(
    { availableBranches: id },
    { $pull: { availableBranches: id } }
  );
  
  return result;
};

const getNearbyBranches = async (lat: number, lng: number, maxDistance: number, limit: number) => {
  const result = await Branch.find({
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

const getBranchProducts = async (branchId: string, filters: any, options: any) => {
  const { limit, page, skip, sortBy, sortOrder } = paginationHelpers.calculatePagination(options);
  
  const andConditions: any[] = [
    {
      $or: [
        { availability: 'ALL_BRANCHES' },
        { availableBranches: branchId }
      ]
    }
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
    const priceCondition: any = {};
    if (filters.minPrice) priceCondition.$gte = Number(filters.minPrice);
    if (filters.maxPrice) priceCondition.$lte = Number(filters.maxPrice);
    andConditions.push({ price: priceCondition });
  }
  
  const whereConditions = { $and: andConditions };
  
  const result = await Product.find(whereConditions)
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);
  
  const total = await Product.countDocuments(whereConditions);
  
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

const getBranchStaff = async (branchId: string) => {
  // In a real application, you would query your User/Staff model
  // This is a placeholder implementation
  return [];
};

const getBranchTypes = async () => {
  return Object.keys(BRANCH_TYPE);
};

const getBranchStatuses = async () => {
  return Object.keys(BRANCH_STATUS);
};

export const BranchService = {
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
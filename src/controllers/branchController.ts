import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { BranchService } from "../services/branchService";
import sendResponse from "../utils/sendResponse";
import httpStatus from "http-status";
import pick from "../utils/pick";

const createBranch = catchAsync(async (req: Request, res: Response) => {
  const branchData = req.body;
  const result = await BranchService.createBranch(branchData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Branch created successfully",
    data: result,
  });
});

const getAllBranches = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, [
    "searchTerm",
    "status",
    "type",
    "city",
    "state",
  ]);
  const options = pick(req.query, ["sortBy", "sortOrder", "limit", "page"]);

  const result = await BranchService.getAllBranches(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Branches fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getBranchById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BranchService.getBranchById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Branch fetched successfully",
    data: result,
  });
});

const updateBranch = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const result = await BranchService.updateBranch(id, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Branch updated successfully",
    data: result,
  });
});

const deleteBranch = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BranchService.deleteBranch(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Branch deleted successfully",
    data: result,
  });
});

const getNearbyBranches = catchAsync(async (req: Request, res: Response) => {
  const { lat, lng, maxDistance, limit } = req.query;
  const result = await BranchService.getNearbyBranches(
    Number(lat),
    Number(lng),
    Number(maxDistance),
    Number(limit)
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Nearby branches fetched successfully",
    data: result,
  });
});

const getBranchProducts = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const filters = pick(req.query, [
    "searchTerm",
    "category",
    "status",
    "minPrice",
    "maxPrice",
  ]);
  const options = pick(req.query, ["sortBy", "sortOrder", "limit", "page"]);

  const result = await BranchService.getBranchProducts(id, filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Branch products fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getBranchStaff = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BranchService.getBranchStaff(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Branch staff fetched successfully",
    data: result,
  });
});

const getBranchTypes = catchAsync(async (req: Request, res: Response) => {
  const result = await BranchService.getBranchTypes();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Branch types fetched successfully",
    data: result,
  });
});

const getBranchStatuses = catchAsync(async (req: Request, res: Response) => {
  const result = await BranchService.getBranchStatuses();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Branch statuses fetched successfully",
    data: result,
  });
});

export const BranchControllers = {
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

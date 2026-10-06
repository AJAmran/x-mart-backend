/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { ProductService } from "../services/productService";
import sendResponse from "../utils/sendResponse";
import httpStatus from "http-status";

const createProduct = catchAsync(async (req: Request, res: Response) => {
  const productData = req.body;
  const result = await ProductService.createProduct(productData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Product created successfully",
    data: result,
  });
});

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  // Extract query parameters
  const {
    searchTerm,
    category,
    minPrice,
    maxPrice,
    minStock,
    maxStock,
    status,
    sortBy,
    sortOrder,
    page,
    limit,
  } = req.query;

  // Build filters object — field names must match ProductRepository.findAll
  const filters: any = {};
  if (searchTerm) {
    filters.searchTerm = (searchTerm as string).trim();
  }
  if (category) {
    filters.category = (category as string).toUpperCase();
  }
  if (minPrice || maxPrice) {
    if (minPrice) filters.minPrice = parseFloat(minPrice as string);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
  }
  if (minStock || maxStock) {
    if (minStock) filters.minStock = parseInt(minStock as string);
    if (maxStock) filters.maxStock = parseInt(maxStock as string);
  }
  if (status) {
    filters.status = (status as string).toUpperCase();
  }

  // Build options object
  const options = {
    page: parseInt(page as string) || 1,
    limit: parseInt(limit as string) || 10,
    sortBy: (sortBy as string) || "createdAt",
    sortOrder: (sortOrder as string) || "desc",
  };

  // Fetch products
  const result = await ProductService.getAllProducts(filters, options);

  // Send response
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Products fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getProductById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductService.getProductById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product fetched successfully",
    data: result,
  });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const result = await ProductService.updateProduct(id, payload);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product updated successfully",
    data: result,
  });
});

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductService.deleteProduct(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product deleted successfully",
    data: result,
  });
});

const updateStock = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { branchId, stock } = req.body;
  const result = await ProductService.updateStock(id, branchId, stock);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Stock updated successfully",
    data: result,
  });
});

const applyDiscount = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const discount = req.body;
  const result = await ProductService.applyDiscount(id, discount);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Discount applied successfully",
    data: result,
  });
});

const removeDiscount = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductService.removeDiscount(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Discount removed successfully",
    data: result,
  });
});

export const ProductControllers = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateStock,
  applyDiscount,
  removeDiscount,
};

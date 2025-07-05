import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { ProductService } from "../services/productService";
import sendResponse from "../utils/sendResponse";
import httpStatus from "http-status";
import { pick } from "../utils/pick";

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
  const filters = pick(req.query, [
    'searchTerm',
    'category',
    'subCategory',
    'status',
    'availability',
    'operationType',
    'tags',
    'minPrice',
    'maxPrice',
    'branchId'
  ]);
  
  const options = pick(req.query, ['sortBy', 'sortOrder', 'limit', 'page']);
  
  const result = await ProductService.getAllProducts(filters, options);
  
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

const advancedProductSearch = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, [
    'searchTerm',
    'category',
    'subCategory',
    'status',
    'availability',
    'operationType',
    'tags',
    'minPrice',
    'maxPrice',
    'minStock',
    'maxStock',
    'branchId',
    'hasDiscount'
  ]);
  
  const options = pick(req.query, ['sortBy', 'sortOrder', 'limit', 'page']);
  
  const result = await ProductService.advancedProductSearch(filters, options);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Products fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getProductsByBranch = catchAsync(async (req: Request, res: Response) => {
  const { branchId } = req.params;
  const filters = pick(req.query, [
    'searchTerm',
    'category',
    'subCategory',
    'status',
    'operationType',
    'tags',
    'minPrice',
    'maxPrice'
  ]);
  
  const options = pick(req.query, ['sortBy', 'sortOrder', 'limit', 'page']);
  
  const result = await ProductService.getProductsByBranch(branchId, filters, options);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Branch products fetched successfully",
    meta: result.meta,
    data: result.data,
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
  const discountData = req.body;
  const result = await ProductService.applyDiscount(id, discountData);
  
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

const getMainCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getMainCategories();
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Categories fetched successfully",
    data: result,
  });
});

const getSubCategories = catchAsync(async (req: Request, res: Response) => {
  const { category } = req.query;
  const result = await ProductService.getSubCategories(category as string);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Sub-categories fetched successfully",
    data: result,
  });
});

export const ProductControllers = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  advancedProductSearch,
  getProductsByBranch,
  updateStock,
  applyDiscount,
  removeDiscount,
  getMainCategories,
  getSubCategories
};
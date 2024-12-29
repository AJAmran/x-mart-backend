import { Request, Response } from "express";
import Product from "../models/Product";
import {
  errorResponse,
  successResponse,
  paginatedResponse,
} from "../utils/responseHandler";

/**
 * Create a new product
 */
export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.create(req.body);
    successResponse(res, product, "Product created successfully", 201);
  } catch (error) {
    errorResponse(res, error);
  }
};

/**
 * Get all products with pagination, search, and filtering
 */
export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "desc",
      search = "",
      ...filters
    } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = {};

    // Apply search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    // Apply filters
    for (const key in filters) {
      query[key] = filters[key];
    }

    // Fetch products and count
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ [sort as string]: order === "desc" ? -1 : 1 })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    paginatedResponse(
      res,
      products,
      total,
      Number(page),
      Number(limit),
      "Products retrieved successfully"
    );
  } catch (error) {
    errorResponse(res, error);
  }
};

/**
 * Get a product by ID
 */
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return errorResponse(res, "Product not found", 404);
    }

    successResponse(res, product, "Product retrieved successfully");
  } catch (error) {
    errorResponse(res, error);
  }
};

/**
 * Update a product by ID
 */
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return errorResponse(res, "Product not found", 404);
    }

    successResponse(res, product, "Product updated successfully");
  } catch (error) {
    errorResponse(res, error);
  }
};

/**
 * Delete a product by ID
 */
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return errorResponse(res, "Product not found", 404);
    }

    successResponse(res, product, "Product deleted successfully");
  } catch (error) {
    errorResponse(res, error);
  }
};

/**
 * Bulk delete products
 */
export const bulkDeleteProducts = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body; // Expecting an array of product IDs
    if (!Array.isArray(ids) || ids.length === 0) {
      return errorResponse(res, "Invalid IDs provided", 400);
    }

    const result = await Product.deleteMany({ _id: { $in: ids } });

    successResponse(
      res,
      result,
      `${result.deletedCount} products deleted successfully`
    );
  } catch (error) {
    errorResponse(res, error);
  }
};

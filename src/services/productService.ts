/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import { TProduct } from "../interface/productInterface";
import { Product } from "../models/Product";

import { FilterQuery } from "mongoose";
import { paginationHelpers } from "../utils/paginationHelpers";
import AppError from "../error/AppErros";

const createProduct = async (payload: TProduct) => {
  // Check if SKU already exists
  const existingProduct = await Product.findOne({ sku: payload.sku });
  if (existingProduct) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Product with this SKU already exists"
    );
  }

  // Set default status if not provided
  if (!payload.status) {
    payload.status = "ACTIVE";
  }

  // Validate inventories for selected branches availability
  if (
    payload.availability === "SELECTED_BRANCHES" &&
    (!payload.availableBranches || payload.availableBranches.length === 0)
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Available branches must be specified for selected branches availability"
    );
  }

  const result = await Product.create(payload);
  return result;
};

const getAllProducts = async (filters: any, options: any) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);

  const andConditions: FilterQuery<TProduct>[] = [];

  // Search term filter
  if (filters.searchTerm) {
    andConditions.push({
      $or: [
        { name: { $regex: filters.searchTerm, $options: "i" } },
        { description: { $regex: filters.searchTerm, $options: "i" } },
        { tags: { $in: [new RegExp(filters.searchTerm, "i")] } },
      ],
    });
  }

  // Other filters
  if (filters.category) {
    andConditions.push({ category: filters.category });
  }

  if (filters.subCategory) {
    andConditions.push({ subCategory: filters.subCategory });
  }

  if (filters.status) {
    andConditions.push({ status: filters.status });
  }

  if (filters.availability) {
    andConditions.push({ availability: filters.availability });
  }

  if (filters.operationType) {
    andConditions.push({ operationType: filters.operationType });
  }

  if (filters.tags) {
    andConditions.push({
      tags: {
        $in: Array.isArray(filters.tags) ? filters.tags : [filters.tags],
      },
    });
  }

  if (filters.minPrice || filters.maxPrice) {
    const priceCondition: any = {};
    if (filters.minPrice) priceCondition.$gte = Number(filters.minPrice);
    if (filters.maxPrice) priceCondition.$lte = Number(filters.maxPrice);
    andConditions.push({ price: priceCondition });
  }

  if (filters.branchId) {
    andConditions.push({
      $or: [
        { availability: "ALL_BRANCHES" },
        { availableBranches: filters.branchId },
        { "inventories.branchId": filters.branchId },
      ],
    });
  }

  const whereConditions =
    andConditions.length > 0 ? { $and: andConditions } : {};

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

const advancedProductSearch = async (filters: any, options: any) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);

  const andConditions: FilterQuery<TProduct>[] = [];

  // Text search
  if (filters.searchTerm) {
    andConditions.push({
      $text: { $search: filters.searchTerm },
    });
  }

  // Category filters
  if (filters.category) {
    andConditions.push({ category: filters.category });
  }

  if (filters.subCategory) {
    andConditions.push({ subCategory: filters.subCategory });
  }

  // Status filter
  if (filters.status) {
    andConditions.push({ status: filters.status });
  }

  // Availability filter
  if (filters.availability) {
    andConditions.push({ availability: filters.availability });
  }

  // Operation type filter
  if (filters.operationType) {
    andConditions.push({ operationType: filters.operationType });
  }

  // Tags filter
  if (filters.tags) {
    andConditions.push({
      tags: {
        $in: Array.isArray(filters.tags) ? filters.tags : [filters.tags],
      },
    });
  }

  // Price range filter
  if (filters.minPrice || filters.maxPrice) {
    const priceCondition: any = {};
    if (filters.minPrice) priceCondition.$gte = Number(filters.minPrice);
    if (filters.maxPrice) priceCondition.$lte = Number(filters.maxPrice);
    andConditions.push({ price: priceCondition });
  }

  // Stock range filter (branch specific if branchId provided)
  if (filters.minStock || filters.maxStock) {
    const stockCondition: any = {};
    if (filters.minStock) stockCondition.$gte = Number(filters.minStock);
    if (filters.maxStock) stockCondition.$lte = Number(filters.maxStock);

    if (filters.branchId) {
      andConditions.push({
        inventories: {
          $elemMatch: {
            branchId: filters.branchId,
            stock: stockCondition,
          },
        },
      });
    } else {
      // For aggregate stock across all branches
      // This would require a more complex aggregation pipeline
      // Simplified version here - would need adjustment based on requirements
      andConditions.push({
        $expr: {
          $let: {
            vars: { totalStock: { $sum: "$inventories.stock" } },
            in: {
              $and: [
                filters.minStock
                  ? { $gte: ["$$totalStock", Number(filters.minStock)] }
                  : true,
                filters.maxStock
                  ? { $lte: ["$$totalStock", Number(filters.maxStock)] }
                  : true,
              ],
            },
          },
        },
      });
    }
  }

  // Discount filter
  if (filters.hasDiscount) {
    andConditions.push({ discount: { $exists: true, $ne: null } });
  }

  // Branch filter
  if (filters.branchId) {
    andConditions.push({
      $or: [
        { availability: "ALL_BRANCHES" },
        { availableBranches: filters.branchId },
        { "inventories.branchId": filters.branchId },
      ],
    });
  }

  const whereConditions =
    andConditions.length > 0 ? { $and: andConditions } : {};

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

const getProductsByBranch = async (
  branchId: string,
  filters: any,
  options: any
) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);

  const andConditions: FilterQuery<TProduct>[] = [
    {
      $or: [
        { availability: "ALL_BRANCHES" },
        { availableBranches: branchId },
        { "inventories.branchId": branchId },
      ],
    },
  ];

  // Add other filters
  if (filters.searchTerm) {
    andConditions.push({
      $or: [
        { name: { $regex: filters.searchTerm, $options: "i" } },
        { description: { $regex: filters.searchTerm, $options: "i" } },
      ],
    });
  }

  if (filters.category) {
    andConditions.push({ category: filters.category });
  }

  if (filters.subCategory) {
    andConditions.push({ subCategory: filters.subCategory });
  }

  if (filters.status) {
    andConditions.push({ status: filters.status });
  }

  if (filters.operationType) {
    andConditions.push({ operationType: filters.operationType });
  }

  if (filters.tags) {
    andConditions.push({
      tags: {
        $in: Array.isArray(filters.tags) ? filters.tags : [filters.tags],
      },
    });
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

const getProductById = async (id: string) => {
  const result = await Product.findById(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }
  return result;
};

const updateProduct = async (id: string, payload: Partial<TProduct>) => {
  const result = await Product.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }
  return result;
};

const deleteProduct = async (id: string) => {
  const result = await Product.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }
  return result;
};

const updateStock = async (id: string, branchId: string, stock: number) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }

  // Find the inventory for the branch
  const inventoryIndex = product.inventories.findIndex(
    (inv) => inv.branchId === branchId
  );

  if (inventoryIndex === -1) {
    // Add new inventory if not exists
    product.inventories.push({ branchId, stock, lowStockThreshold: 0 });
  } else {
    // Update existing inventory
    product.inventories[inventoryIndex].stock = stock;

    // Update status based on stock
    if (stock <= 0) {
      product.status = "OUT_OF_STOCK";
    } else if (product.status === "OUT_OF_STOCK") {
      product.status = "ACTIVE";
    }
  }

  await product.save();
  return product;
};

const applyDiscount = async (id: string, discountData: any) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }

  product.discount = {
    type: discountData.type,
    value: discountData.value,
    startDate: discountData.startDate,
    endDate: discountData.endDate,
    applicableBranches: discountData.branchIds || [],
  };

  await product.save();
  return product;
};

const removeDiscount = async (id: string) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }

  product.discount = undefined;
  await product.save();
  return product;
};

const getMainCategories = async () => {
  const categories = await Product.distinct("category");
  return categories;
};

const getSubCategories = async (category?: string) => {
  const query: any = {};
  if (category) {
    query.category = category;
  }
  const subCategories = await Product.distinct("subCategory", query);
  return subCategories.filter((subCat) => subCat); // Remove null/undefined
};

export const ProductService = {
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
  getSubCategories,
};

import httpStatus from "http-status";
import { TProduct } from "../interface/productInterface";
import { Product } from "../models/Product";
import AppError from "../error/AppErros";

const createProduct = async (payload: TProduct) => {
  const result = await Product.create(payload);
  return result;
};

const getAllProducts = async (filters: any, options: any) => {
  const { page, limit, sortBy, sortOrder } = options;

  const skip = (page - 1) * limit;
  const sortCriteria: { [key: string]: 1 | -1 } = {
    [sortBy]: sortOrder === "desc" ? -1 : 1,
  };

  const result = await Product.find(filters)
    .sort(sortCriteria)
    .skip(skip)
    .limit(limit)
    .populate("createdBy", "name email");

  const total = await Product.countDocuments(filters);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getProductById = async (id: string) => {
  const result = await Product.findById(id).populate("createdBy", "name email");
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

const updateStock = async (id: string, stock: number) => {
  const result = await Product.findByIdAndUpdate(id, { stock }, { new: true });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }
  return result;
};

const applyDiscount = async (id: string, discount: any) => {
  const result = await Product.findByIdAndUpdate(
    id,
    { discount },
    { new: true }
  );
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }
  return result;
};

const removeDiscount = async (id: string) => {
  const result = await Product.findByIdAndUpdate(
    id,
    { $unset: { discount: 1 } },
    { new: true }
  );
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }
  return result;
};

export const ProductService = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateStock,
  applyDiscount,
  removeDiscount,
};

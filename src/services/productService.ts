import httpStatus from "http-status";
import { TProduct } from "../interface/productInterface";
import { productRepository } from "../repositories/product.repository";
import AppError from "../error/AppErros";

const createProduct = async (payload: TProduct) => {
  return productRepository.create(payload);
};

const getAllProducts = async (filters: any, options: any) => {
  const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = options;
  return productRepository.findAll(filters, { page, limit, sortBy, sortOrder });
};

const getProductById = async (id: string) => {
  const result = await productRepository.findById(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }
  return result;
};

const updateProduct = async (id: string, payload: Partial<TProduct>) => {
  const result = await productRepository.update(id, payload);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }
  return result;
};

const deleteProduct = async (id: string) => {
  const result = await productRepository.delete(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }
  return result;
};

const updateStock = async (id: string, branchId: string, stock: number) => {
  const result = await productRepository.updateStock(id, branchId, stock);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }
  return result;
};

const applyDiscount = async (id: string, discount: any) => {
  const result = await productRepository.applyDiscount(id, discount);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }
  return result;
};

const removeDiscount = async (id: string) => {
  const result = await productRepository.removeDiscount(id);
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

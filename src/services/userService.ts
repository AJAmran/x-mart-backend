import { USER_ROLE, USER_STATUS } from "../constants/userConstant";
import AppError from "../error/AppErros";
import { User } from "../models/User";
import httpStatus from "http-status";

const getAllUsers = async () => {
  const result = await User.find().select("-password -passwordChangedAt");
  return result;
};

const getUserById = async (id: string) => {
  const result = await User.findById(id).select("-password -passwordChangedAt");
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  return result;
};

const updateUser = async (id: string, payload: Partial<any>) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // Prevent updating sensitive fields
  const { password, role, status, ...updateData } = payload;

  const result = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).select("-password -passwordChangedAt");

  return result;
};

const deleteUser = async (id: string) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  return user;
};

const updateUserStatus = async (id: string, status: keyof typeof USER_STATUS) => {
  const user = await User.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  ).select("-password -passwordChangedAt");
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  return user;
};

const updateUserRole = async (id: string, role: keyof typeof USER_ROLE) => {
  const user = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true, runValidators: true }
  ).select("-password -passwordChangedAt");
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  return user;
};

export const UserService = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserStatus,
  updateUserRole,
};
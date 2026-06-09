import { Types } from "mongoose";
import { UserService } from "../services/userService";
import { catchAsync } from "../utils/catchAsync";
import sendResponse from "../utils/sendResponse";
import httpStatus from "http-status";

import pick from "../utils/pick";
import AppError from "../error/AppErros";

const isOwnerOrAdmin = (req: import("express").Request, targetId: string) => {
  const role = (req.user as { role?: string } | undefined)?.role;
  const userId = (req.user as { _id?: string } | undefined)?._id;
  return role === "ADMIN" || userId === targetId;
};

const validateObjectId = (id: string, label = "id") => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, `Invalid ${label}`);
  }
};

const getAllUsers = catchAsync(async (req, res) => {
  const filters = pick(req.query, ["search", "status", "role"]);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await UserService.getAllUsers(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getUserById = catchAsync(async (req, res) => {
  const { id } = req.params;
  validateObjectId(id, "user id");
  // High-priority: A01 IDOR — non-admins can only fetch themselves
  if (!isOwnerOrAdmin(req, id)) {
    return sendResponse(res, {
      statusCode: httpStatus.FORBIDDEN,
      success: false,
      message: "You are not authorized to access this resource",
      data: null,
    });
  }

  const result = await UserService.getUserById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User retrieved successfully",
    data: result,
  });
});

const updateUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  validateObjectId(id, "user id");
  if (!isOwnerOrAdmin(req, id)) {
    return sendResponse(res, {
      statusCode: httpStatus.FORBIDDEN,
      success: false,
      message: "You are not authorized to perform this action",
      data: null,
    });
  }

  const result = await UserService.updateUser(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User updated successfully",
    data: result,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  validateObjectId(id, "user id");
  if (!isOwnerOrAdmin(req, id)) {
    return sendResponse(res, {
      statusCode: httpStatus.FORBIDDEN,
      success: false,
      message: "You are not authorized to perform this action",
      data: null,
    });
  }
  await UserService.deleteUser(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User deleted successfully",
    data: null,
  });
});

const updateUserStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  validateObjectId(id, "user id");
  if (!isOwnerOrAdmin(req, id)) {
    return sendResponse(res, {
      statusCode: httpStatus.FORBIDDEN,
      success: false,
      message: "You are not authorized to perform this action",
      data: null,
    });
  }
  const { status } = req.body;
  const result = await UserService.updateUserStatus(id, status);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User status updated successfully",
    data: result,
  });
});

const updateUserRole = catchAsync(async (req, res) => {
  const { id } = req.params;
  validateObjectId(id, "user id");
  // Only admins can change roles
  if ((req.user as { role?: string } | undefined)?.role !== "ADMIN") {
    return sendResponse(res, {
      statusCode: httpStatus.FORBIDDEN,
      success: false,
      message: "Only admins can change roles",
      data: null,
    });
  }
  const { role } = req.body;
  const result = await UserService.updateUserRole(id, role);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User role updated successfully",
    data: result,
  });
});

export const UserControllers = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserStatus,
  updateUserRole,
};

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import User from "../models/User";
import { successResponse, errorResponse } from "../utils/responseHandler";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your_refresh_secret";

// Generate Tokens
const generateAccessToken = (user: any) => {
  return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: "1h",
  });
};

const generateRefreshToken = (user: any) => {
  return jwt.sign({ id: user._id, role: user.role }, JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

// Register User
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    successResponse(res, newUser, "User registered successfully", 201);
  } catch (error) {
    errorResponse(res, error);
  }
};

// Login User
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return errorResponse(res, "Invalid credentials", 401);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return errorResponse(res, "Invalid credentials", 401);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    successResponse(res, { accessToken, refreshToken }, "Login successful");
  } catch (error) {
    errorResponse(res, error);
  }
};

// Get All Users (Admin)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password -refreshToken");
    successResponse(res, users, "Users retrieved successfully");
  } catch (error) {
    errorResponse(res, error);
  }
};

// Get User Profile
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select("-password -refreshToken");

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    successResponse(res, user, "User profile retrieved successfully");
  } catch (error) {
    errorResponse(res, error);
  }
};

// Update User Profile
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    }).select("-password -refreshToken");

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    successResponse(res, user, "User profile updated successfully");
  } catch (error) {
    errorResponse(res, error);
  }
};

// Delete User (Admin)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    successResponse(res, null, "User deleted successfully");
  } catch (error) {
    errorResponse(res, error);
  }
};

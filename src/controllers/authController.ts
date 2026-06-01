import config from "../config";
import { AuthService } from "../services/authService";
import { catchAsync } from "../utils/catchAsync";
import sendResponse from "../utils/sendResponse";
import httpStatus from "http-status";

const setRefreshTokenCookie = (res: any, refreshToken: string) => {
  const isProduction = config.nodeEnv === "production";
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    // SameSite=None is required for cross-domain cookie delivery on Vercel
    // (x-mart-client.vercel.app → x-mart-backend.vercel.app).
    // SameSite=Strict silently drops the cookie on cross-site requests.
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction, // SameSite=None MUST pair with Secure=true
    path: "/",           // widened from "/api/v1/auth" — Vercel serverless needs it
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const registerUser = catchAsync(async (req, res) => {
  const result = await AuthService.registerUser(req.body);
  setRefreshTokenCookie(res, result.refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User registered successfully",
    data: { accessToken: result.accessToken },
  });
});

const loginUser = catchAsync(async (req, res) => {
  const result = await AuthService.loginUser(req.body);
  setRefreshTokenCookie(res, result.refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged in successfully",
    data: { accessToken: result.accessToken },
  });
});

const changePassword = catchAsync(async (req, res) => {
  const { ...passwordData } = req.body;

  const result = await AuthService.changePassword(req.user, passwordData);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password updated successfully!',
    data: result,
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await AuthService.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token retried successfully",
    data: result,
  });
});

export const AuthControllers = {
  registerUser,
  loginUser,
  changePassword,
  refreshToken,
};

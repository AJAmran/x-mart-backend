import config from "../config";
import { AuthService } from "../services/authService";
import { catchAsync } from "../utils/catchAsync";
import sendResponse from "../utils/sendResponse";
import httpStatus from "http-status";

const isProduction = config.nodeEnv === "production";

// C-10 FIX: both tokens are now httpOnly + Secure + SameSite=None. The browser
// keeps them off-limits to JS (XSS can't steal them) and they are sent on
// cross-site redirects between the Vercel subdomains.
const setAuthCookies = (
  res: import("express").Response,
  tokens: { accessToken: string; refreshToken: string }
) => {
  const common = {
    httpOnly: true as const,
    secure: isProduction,
    sameSite: isProduction ? ("none" as const) : ("lax" as const),
    path: "/",
  };
  res.cookie("accessToken", tokens.accessToken, {
    ...common,
    maxAge: 15 * 60 * 1000, // 15 min — matches access token expiry
  });
  res.cookie("refreshToken", tokens.refreshToken, {
    ...common,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

const clearAuthCookies = (res: import("express").Response) => {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });
};

const registerUser = catchAsync(async (req, res) => {
  const result = await AuthService.registerUser(req.body);
  setAuthCookies(res, result);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User registered successfully",
    data: { user: result.user },
  });
});

const loginUser = catchAsync(async (req, res) => {
  const result = await AuthService.loginUser(req.body);
  setAuthCookies(res, result);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged in successfully",
    data: { user: result.user },
  });
});

const changePassword = catchAsync(async (req, res) => {
  const passwordData = req.body;
  const result = await AuthService.changePassword(req.user, passwordData);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password updated successfully!",
    data: result,
  });
});

const refreshToken = catchAsync(async (req, res) => {
  // The refresh token arrives via the httpOnly cookie, not the request body
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: "Refresh token missing",
      data: null,
    });
  }
  const result = await AuthService.refreshToken(refreshToken);
  setAuthCookies(res, result);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token refreshed",
    data: { user: result.user },
  });
});

const logout = catchAsync(async (req, res) => {
  clearAuthCookies(res);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged out",
    data: null,
  });
});

const getMe = catchAsync(async (req, res) => {
  // The auth middleware has already attached req.user. Echo it back safely.
  const { _id, name, email, mobileNumber, role, status, profilePhoto } = req.user as {
    _id?: string; name?: string; email?: string; mobileNumber?: string;
    role?: string; status?: string; profilePhoto?: string | null;
  };
  if (!_id) {
    return sendResponse(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: "Not authenticated",
      data: null,
    });
  }
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Current user",
    data: { user: { _id, name, email, mobileNumber, role, status, profilePhoto } },
  });
});

export const AuthControllers = {
  registerUser,
  loginUser,
  changePassword,
  refreshToken,
  logout,
  getMe,
};

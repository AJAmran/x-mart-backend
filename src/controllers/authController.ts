import config from "../config";
import { AuthService } from "../services/authService";
import { catchAsync } from "../utils/catchAsync";
import sendResponse from "../utils/sendResponse";
import httpStatus from "http-status";

const registeruser = catchAsync(async (req, res) => {
  const result = await AuthService.registerUser(req.body);
  const { accessToken, refreshToken } = result;

  res.cookie("refreshToken", refreshToken, {
    secure: config.NODE_ENV === "production",
    httpOnly: true,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User registered successfully",
    data: { accessToken, refreshToken },
  });
});

export const AuthControllers = {
  registeruser,
};

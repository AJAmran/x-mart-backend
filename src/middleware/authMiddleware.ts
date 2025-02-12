import { NextFunction, Request, Response } from "express";
import { USER_ROLE } from "../constants/userConstant";
import { catchAsync } from "../utils/catchAsync";
import AppError from "../error/AppErros";
import httpStatus from "http-status";
import { verifyToken } from "../utils/VerifyJWt";
import config from "../config";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../models/User";

const auth = (...requiredRoles: (keyof typeof USER_ROLE)[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    // Check if token is present
    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized access");
    }

    const decoded = verifyToken(
      token,
      config.jwtSecret as string
    ) as JwtPayload;

    const { role, email, iat } = decoded;

    //check if user is exist
    const user = await User.isUserExistsByEmail(email);

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    //checking if the user already deleted

    const status = user?.status;

    if (status === "BLOCKED") {
      throw new AppError(httpStatus.FORBIDDEN, "This user is blocked");
    }

    if (
      user.passwordChangedAt &&
      User.isJWTIssuedBeforePasswordChanged(
        user.passwordChangedAt,
        iat as number
      )
    ) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized access");
    }

    if (requiredRoles && !requiredRoles.includes(role)) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not allowed to access this route"
      );
    }

    req.user = decoded as JwtPayload;
    next();
  });
};

export default auth;

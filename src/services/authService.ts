import { USER_ROLE } from "../constants/userConstant";
import { TLoginUser, TRegisterUser } from "../interface/authInterface";
import { User } from "../models/User";
import httpStatus from "http-status";
import { createToken } from "../utils/VerifyJWt";
import config from "../config";
import AppError from "../error/AppErros";
import { JwtPayload } from "jsonwebtoken";
import bcryptjs from "bcryptjs";

const registerUser = async (payload: TRegisterUser) => {
  // checking if the user is exist
  const user = await User.isUserExistsByEmail(payload?.email);

  if (user) {
    throw new AppError(httpStatus.NOT_FOUND, "This user is already exist!");
  }

  payload.role = USER_ROLE.USER;

  //create new user
  const newUser = await User.create(payload);

  //create token and sent to the  client

  const jwtPayload = {
    _id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    mobileNumber: newUser.mobileNumber,
    role: newUser.role,
    status: newUser.status,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwtSecret as string,
    config.jwtExpiresIn as string
  );

  const refreshToken = createToken(
    jwtPayload,
    config.refreshSecret as string,
    config.refreshExpiresIn as string
  );

  return { accessToken, refreshToken };
};

const loginUser = async (payload: TLoginUser) => {
  // check if the user is exist
  const user = await User.isUserExistsByEmail(payload.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  // check if the user is blocked

  if (user.status === "BLOCKED") {
    throw new AppError(httpStatus.FORBIDDEN, "This user is blocked!");
  }

  // check if the password is correct
  if (!(await User.isPasswordMatched(payload?.password, user?.password))) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Password is incorrect!");
  }

  const jwtPayload = {
    _id: user._id,
    name: user.name,
    email: user.email,
    mobileNumber: user.mobileNumber,
    role: user.role,
    status: user.status,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwtSecret as string,
    config.jwtExpiresIn as string
  );

  const refreshToken = createToken(
    jwtPayload,
    config.refreshSecret as string,
    config.refreshExpiresIn as string
  );

  return { accessToken, refreshToken };
};

const changePassword = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string }
) => {
  // checking if the user is exist
  const user = await User.isUserExistsByEmail(userData.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "This user is not found!");
  }

  // checking if the user is blocked

  const userStatus = user?.status;

  if (userStatus === "BLOCKED") {
    throw new AppError(httpStatus.FORBIDDEN, "This user is blocked!");
  }

  //checking if the password is correct

  if (!(await User.isPasswordMatched(payload.oldPassword, user?.password)))
    throw new AppError(httpStatus.FORBIDDEN, "Password do not matched");

  //hash new password
  const newHashedPassword = await bcryptjs.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  await User.findOneAndUpdate(
    {
      email: userData.email,
      role: userData.role,
    },
    {
      password: newHashedPassword,
      passwordChangedAt: new Date(),
    }
  );

  return null;
};

export const AuthService = {
  registerUser,
  loginUser,
  changePassword,
};

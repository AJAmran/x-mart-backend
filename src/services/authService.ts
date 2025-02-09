import { USER_ROLE } from "../constants/userConstant";
import { TRegisterUser } from "../interface/authInterface";
import { User } from "../models/User";
import AppError from "../utils/appError";
import httpStatus from "http-status";
import { createToken } from "../utils/VerifyJWt";
import config from "../config";

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

export const AuthService = {
  registerUser,
};

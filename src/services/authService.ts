import { USER_ROLE, USER_STATUS } from "../constants/userConstant";
import { TLoginUser, TRegisterUser } from "../interface/authInterface";
import { User } from "../models/User";
import httpStatus from "http-status";
import { createToken } from "../utils/VerifyJWt";
import config from "../config";
import AppError from "../error/AppErros";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";

type JwtRole = keyof typeof USER_ROLE;
type JwtStatus = keyof typeof USER_STATUS;

type AnyUser = {
  _id?: unknown;
  name: string;
  email: string;
  mobileNumber?: string;
  role: string;
  status: string;
  profilePhoto?: string | null;
};

const toRole = (r: string): JwtRole => (r in USER_ROLE ? (r as JwtRole) : USER_ROLE.USER);
const toStatus = (s: string): JwtStatus => (s in USER_STATUS ? (s as JwtStatus) : USER_STATUS.ACTIVE);

const buildJwtPayload = (user: AnyUser) => ({
  _id: String(user._id),
  name: user.name,
  email: user.email,
  mobileNumber: user.mobileNumber ?? "",
  role: toRole(user.role),
  status: toStatus(user.status),
  profilePhoto: user.profilePhoto ?? null,
});

type SignablePayload = {
  _id?: string;
  name: string;
  email: string;
  mobileNumber?: string;
  role: JwtRole;
  status: JwtStatus;
};

const signTokens = (payload: SignablePayload) => ({
  accessToken: createToken(payload, config.jwtSecret as string, config.jwtExpiresIn as string),
  refreshToken: createToken(payload, config.refreshSecret as string, config.refreshExpiresIn as string),
});

const stripUser = (user: AnyUser) => ({
  _id: String(user._id),
  name: user.name,
  email: user.email,
  mobileNumber: user.mobileNumber ?? "",
  role: user.role,
  status: user.status,
  profilePhoto: user.profilePhoto ?? null,
});

const registerUser = async (payload: TRegisterUser) => {
  // The User model already enforces unique email (lowercased) and unique mobile.
  // We double-check defensively for clearer error messages.
  const existing = await User.findOne({ email: payload.email.toLowerCase() });
  if (existing) {
    throw new AppError(httpStatus.CONFLICT, "An account with this email already exists");
  }

  const newUser = await User.create({
    ...payload,
    role: USER_ROLE.USER,
    email: payload.email.toLowerCase(),
  });

  const payloadJwt = buildJwtPayload(newUser);
  const tokens = signTokens(payloadJwt);

  return { ...tokens, user: stripUser(newUser) };
};

const loginUser = async (payload: TLoginUser) => {
  const user = await User.isUserExistsByEmail(payload.email);
  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials");
  }

  if (user.status === "BLOCKED") {
    throw new AppError(httpStatus.FORBIDDEN, "This account is blocked");
  }

  if (!(await User.isPasswordMatched(payload.password, user.password))) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials");
  }

  const payloadJwt = buildJwtPayload(user);
  const tokens = signTokens(payloadJwt);

  return { ...tokens, user: stripUser(user) };
};

const changePassword = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string }
) => {
  if (!userData?.email) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const user = await User.isUserExistsByEmail(userData.email);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.status === "BLOCKED") {
    throw new AppError(httpStatus.FORBIDDEN, "This account is blocked");
  }

  if (!(await User.isPasswordMatched(payload.oldPassword, user.password))) {
    throw new AppError(httpStatus.FORBIDDEN, "Current password is incorrect");
  }

  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  await User.findOneAndUpdate(
    { email: userData.email },
    {
      password: newHashedPassword,
      passwordChangedAt: new Date(),
    }
  );

  return null;
};

const refreshToken = async (token: string) => {
  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, config.refreshSecret as string) as JwtPayload;
  } catch (err) {
    const code = (err as { name?: string }).name;
    if (code === "TokenExpiredError") {
      throw new AppError(httpStatus.UNAUTHORIZED, "Refresh token expired");
    }
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid refresh token");
  }

  const { email } = decoded;
  if (!email) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token payload");
  }

  const user = await User.isUserExistsByEmail(email);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.status === "BLOCKED") {
    throw new AppError(httpStatus.FORBIDDEN, "This account is blocked");
  }

  if (
    user.passwordChangedAt &&
    User.isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, decoded.iat as number)
  ) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Token revoked: password changed");
  }

  const payloadJwt = buildJwtPayload(user);
  const tokens = signTokens(payloadJwt);

  return { ...tokens, user: stripUser(user) };
};

export const AuthService = {
  registerUser,
  loginUser,
  changePassword,
  refreshToken,
};

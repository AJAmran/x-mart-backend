import { NextFunction, Request, Response } from "express";
import { LRUCache } from "lru-cache";
import { USER_ROLE } from "../constants/userConstant";
import { catchAsync } from "../utils/catchAsync";
import AppError from "../error/AppErros";
import httpStatus from "http-status";
import { verifyToken } from "../utils/VerifyJWt";
import config from "../config";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../models/User";

// ── C-06 FIX: in-process LRU so the per-request DB lookup happens at most
// once per user per TTL. TTL=30s balances staleness of `status`/`role` with
// the DB-roundtrip elimination that Vercel cold starts need.
type CachedUser = {
  _id: string;
  email: string;
  role: string;
  status: string;
  passwordChangedAt: Date | null;
};

const userCache = new LRUCache<string, CachedUser>({
  max: 1000,
  ttl: 30_000,
});

const auth = (...requiredRoles: (keyof typeof USER_ROLE)[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // High-priority fix: accept the access token from the Authorization header
    // (server-to-server, mobile, SPA fallback) OR the httpOnly cookie that the
    // web app now sets. The browser sends the cookie automatically with
    // credentials: "include".
    const authHeader = req.headers.authorization;
    const cookieToken = (req as { cookies?: Record<string, string> }).cookies?.accessToken;
    const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    const token = headerToken || cookieToken;

    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized access");
    }

    let decoded: JwtPayload;
    try {
      decoded = verifyToken(token, config.jwtSecret as string) as JwtPayload;
    } catch (err) {
      // High-priority: handle JWT errors explicitly instead of letting them
      // become 500s via the generic error path.
      const code = (err as { name?: string }).name;
      if (code === "TokenExpiredError") {
        throw new AppError(httpStatus.UNAUTHORIZED, "Access token expired");
      }
      if (code === "JsonWebTokenError") {
        throw new AppError(httpStatus.UNAUTHORIZED, "Invalid access token");
      }
      throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized access");
    }

    const { role, email, iat, _id: tokenUserId } = decoded;
    if (!email) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token payload");
    }

    const cacheKey = email.toLowerCase();
    let cached = userCache.get(cacheKey);
    if (!cached) {
      const user = await User.isUserExistsByEmail(email);
      if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
      }
      cached = {
        _id: String(user._id),
        email: user.email,
        role: user.role,
        status: user.status,
        passwordChangedAt: user.passwordChangedAt ?? null,
      };
      userCache.set(cacheKey, cached);
    }

    if (cached.status === "BLOCKED") {
      throw new AppError(httpStatus.FORBIDDEN, "This user is blocked");
    }

    if (
      cached.passwordChangedAt &&
      User.isJWTIssuedBeforePasswordChanged(
        cached.passwordChangedAt,
        iat as number
      )
    ) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Token revoked: password changed");
    }

    if (requiredRoles.length > 0 && !requiredRoles.includes(role as keyof typeof USER_ROLE)) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not allowed to access this route"
      );
    }

    // Prefer the database-truth _id, fall back to the token one.
    req.user = {
      ...decoded,
      _id: tokenUserId ?? cached._id,
      role: cached.role,
      status: cached.status,
      email: cached.email,
    } as JwtPayload;

    next();
  });
};

export default auth;

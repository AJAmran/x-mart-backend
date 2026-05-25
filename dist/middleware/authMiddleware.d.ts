import { NextFunction, Request, Response } from "express";
import { USER_ROLE } from "../constants/userConstant";
declare const auth: (...requiredRoles: (keyof typeof USER_ROLE)[]) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export default auth;

import { USER_ROLE, USER_STATUS } from "../constants/userConstant";
import { JwtPayload } from "jsonwebtoken";
export declare const createToken: (jwtPayload: {
    _id?: string;
    name: string;
    email: string;
    mobileNumber?: string;
    role: keyof typeof USER_ROLE;
    status: keyof typeof USER_STATUS;
}, secret: string, expiresIn: string) => string;
export declare const verifyToken: (token: string, secret: string) => JwtPayload | Error;

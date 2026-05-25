import { TLoginUser, TRegisterUser } from "../interface/authInterface";
import { JwtPayload } from "jsonwebtoken";
export declare const AuthService: {
    registerUser: (payload: TRegisterUser) => Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    loginUser: (payload: TLoginUser) => Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    changePassword: (userData: JwtPayload, payload: {
        oldPassword: string;
        newPassword: string;
    }) => Promise<null>;
    refreshToken: (token: string) => Promise<{
        accessToken: string;
    }>;
};

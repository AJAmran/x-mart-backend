import { TLoginUser, TRegisterUser } from "../interface/authInterface";
import { JwtPayload } from "jsonwebtoken";
export declare const AuthService: {
    registerUser: (payload: TRegisterUser) => Promise<{
        user: {
            _id: string;
            name: string;
            email: string;
            mobileNumber: string;
            role: string;
            status: string;
            profilePhoto: string | null;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    loginUser: (payload: TLoginUser) => Promise<{
        user: {
            _id: string;
            name: string;
            email: string;
            mobileNumber: string;
            role: string;
            status: string;
            profilePhoto: string | null;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    changePassword: (userData: JwtPayload, payload: {
        oldPassword: string;
        newPassword: string;
    }) => Promise<null>;
    refreshToken: (token: string) => Promise<{
        user: {
            _id: string;
            name: string;
            email: string;
            mobileNumber: string;
            role: string;
            status: string;
            profilePhoto: string | null;
        };
        accessToken: string;
        refreshToken: string;
    }>;
};

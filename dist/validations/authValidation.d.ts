import { z } from "zod";
export declare const AuthValidation: {
    registerValidationSchema: z.ZodObject<{
        body: z.ZodObject<{
            name: z.ZodString;
            email: z.ZodString;
            password: z.ZodString;
            mobileNumber: z.ZodString;
            profilePhoto: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            email: string;
            password: string;
            mobileNumber: string;
            profilePhoto?: string | undefined;
        }, {
            name: string;
            email: string;
            password: string;
            mobileNumber: string;
            profilePhoto?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            name: string;
            email: string;
            password: string;
            mobileNumber: string;
            profilePhoto?: string | undefined;
        };
    }, {
        body: {
            name: string;
            email: string;
            password: string;
            mobileNumber: string;
            profilePhoto?: string | undefined;
        };
    }>;
    loginValidationSchema: z.ZodObject<{
        body: z.ZodObject<{
            email: z.ZodString;
            password: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            email: string;
            password: string;
        }, {
            email: string;
            password: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            email: string;
            password: string;
        };
    }, {
        body: {
            email: string;
            password: string;
        };
    }>;
    changePasswordValidationSchema: z.ZodObject<{
        body: z.ZodObject<{
            oldPassword: z.ZodString;
            newPassword: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            oldPassword: string;
            newPassword: string;
        }, {
            oldPassword: string;
            newPassword: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            oldPassword: string;
            newPassword: string;
        };
    }, {
        body: {
            oldPassword: string;
            newPassword: string;
        };
    }>;
    refreshTokenValidationSchema: z.ZodObject<{
        cookies: z.ZodObject<{
            refreshToken: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            refreshToken: string;
        }, {
            refreshToken: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        cookies: {
            refreshToken: string;
        };
    }, {
        cookies: {
            refreshToken: string;
        };
    }>;
};

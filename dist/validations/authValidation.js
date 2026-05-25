"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthValidation = void 0;
const zod_1 = require("zod");
const passwordSchema = zod_1.z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");
const registerValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ required_error: "Name is required" }),
        email: zod_1.z
            .string({ required_error: "Email is required" })
            .email("Invalid email format"),
        password: passwordSchema,
        mobileNumber: zod_1.z
            .string({ required_error: "Mobile number is required" })
            .regex(/^01\d{9}$/, "Phone must be 11 digits starting with 01"),
        profilePhoto: zod_1.z.string().url().optional(),
    }),
});
const loginValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .string({ required_error: "Email is required" })
            .email("Invalid email format"),
        password: zod_1.z.string({ required_error: "Password is required" }),
    }),
});
const changePasswordValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        oldPassword: zod_1.z.string({ required_error: "Old password is required" }),
        newPassword: passwordSchema,
    }),
});
const refreshTokenValidationSchema = zod_1.z.object({
    cookies: zod_1.z.object({
        refreshToken: zod_1.z.string({
            required_error: "Refresh token is required!",
        }),
    }),
});
exports.AuthValidation = {
    registerValidationSchema,
    loginValidationSchema,
    changePasswordValidationSchema,
    refreshTokenValidationSchema,
};
//# sourceMappingURL=authValidation.js.map
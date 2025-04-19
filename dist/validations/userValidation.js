"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = void 0;
const zod_1 = require("zod");
const updateUserValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        email: zod_1.z.string().email().optional(),
        mobileNumber: zod_1.z.string().optional(),
        profilePhoto: zod_1.z.string().optional(),
    }),
});
const updateStatusValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(["ACTIVE", "BLOCKED"]),
    }),
});
const updateRoleValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        role: zod_1.z.enum(["ADMIN", "USER"]),
    }),
});
exports.UserValidation = {
    updateUserValidationSchema,
    updateStatusValidationSchema,
    updateRoleValidationSchema,
};

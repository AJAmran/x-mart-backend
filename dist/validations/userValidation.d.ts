import { z } from "zod";
export declare const UserValidation: {
    updateUserValidationSchema: z.ZodObject<{
        body: z.ZodObject<{
            name: z.ZodOptional<z.ZodString>;
            email: z.ZodOptional<z.ZodString>;
            mobileNumber: z.ZodOptional<z.ZodString>;
            profilePhoto: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name?: string | undefined;
            email?: string | undefined;
            mobileNumber?: string | undefined;
            profilePhoto?: string | undefined;
        }, {
            name?: string | undefined;
            email?: string | undefined;
            mobileNumber?: string | undefined;
            profilePhoto?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            name?: string | undefined;
            email?: string | undefined;
            mobileNumber?: string | undefined;
            profilePhoto?: string | undefined;
        };
    }, {
        body: {
            name?: string | undefined;
            email?: string | undefined;
            mobileNumber?: string | undefined;
            profilePhoto?: string | undefined;
        };
    }>;
    updateStatusValidationSchema: z.ZodObject<{
        body: z.ZodObject<{
            status: z.ZodEnum<["ACTIVE", "BLOCKED"]>;
        }, "strip", z.ZodTypeAny, {
            status: "ACTIVE" | "BLOCKED";
        }, {
            status: "ACTIVE" | "BLOCKED";
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            status: "ACTIVE" | "BLOCKED";
        };
    }, {
        body: {
            status: "ACTIVE" | "BLOCKED";
        };
    }>;
    updateRoleValidationSchema: z.ZodObject<{
        body: z.ZodObject<{
            role: z.ZodEnum<["ADMIN", "USER"]>;
        }, "strip", z.ZodTypeAny, {
            role: "ADMIN" | "USER";
        }, {
            role: "ADMIN" | "USER";
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            role: "ADMIN" | "USER";
        };
    }, {
        body: {
            role: "ADMIN" | "USER";
        };
    }>;
};

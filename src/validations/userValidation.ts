import { z } from "zod";

const updateUserValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    mobileNumber: z.string().optional(),
    profilePhoto: z.string().optional(),
  }),
});

const updateStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(["ACTIVE", "BLOCKED"]),
  }),
});

const updateRoleValidationSchema = z.object({
  body: z.object({
    role: z.enum(["ADMIN", "USER"]),
  }),
});

export const UserValidation = {
  updateUserValidationSchema,
  updateStatusValidationSchema,
  updateRoleValidationSchema,
};
import { z } from "zod";

const registerValidationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: "Name is required",
    }),
    email: z.string({
      required_error: "Email is required",
    }),
    password: z.string({ required_error: "Password is required" }),
    mobileNumber: z.string({ required_error: "Mobile number is required" }),
    profilePhoto: z.string(),
  }),
});

export const AuthValidation = {
  registerValidationSchema,
};

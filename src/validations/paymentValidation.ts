import { z } from "zod";
import { Types } from "mongoose";

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

const paymentIdSchema = z.object({
  id: z
    .string()
    .refine((value) => Types.ObjectId.isValid(value), { message: "Invalid payment id" }),
});

export const PaymentValidation = {
  paginationSchema,
  paymentIdSchema,
};

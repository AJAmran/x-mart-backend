"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentValidation = void 0;
const zod_1 = require("zod");
const mongoose_1 = require("mongoose");
const paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(10),
});
const paymentIdSchema = zod_1.z.object({
    id: zod_1.z
        .string()
        .refine((value) => mongoose_1.Types.ObjectId.isValid(value), { message: "Invalid payment id" }),
});
exports.PaymentValidation = {
    paginationSchema,
    paymentIdSchema,
};
//# sourceMappingURL=paymentValidation.js.map
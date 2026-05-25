"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchValidation = void 0;
const zod_1 = require("zod");
const branchConstant_1 = require("../constants/branchConstant");
const contactSchema = zod_1.z.object({
    phone: zod_1.z.string().min(1, { message: "Phone number is required" }),
    email: zod_1.z.string().email({ message: "Invalid email address" }),
    manager: zod_1.z.string().optional(),
    emergencyContact: zod_1.z.string().optional()
});
const locationSchema = zod_1.z.object({
    address: zod_1.z.string().min(1, { message: "Address is required" }),
    city: zod_1.z.string().min(1, { message: "City is required" }),
    state: zod_1.z.string().min(1, { message: "State is required" }),
    country: zod_1.z.string().min(1, { message: "Country is required" }),
    postalCode: zod_1.z.string().min(1, { message: "Postal code is required" }),
    coordinates: zod_1.z.object({
        type: zod_1.z.literal('Point', { message: "Type must be 'Point'" }),
        coordinates: zod_1.z.array(zod_1.z.number()).length(2, { message: "Coordinates must contain exactly [lng, lat]" })
    }).optional()
});
const operatingHoursSchema = zod_1.z.object({
    dayType: zod_1.z.enum(Object.keys(branchConstant_1.OPERATING_HOURS), {
        required_error: "Day type is required"
    }),
    openingTime: zod_1.z.string().optional(),
    closingTime: zod_1.z.string().optional(),
    is24Hours: zod_1.z.boolean().optional(),
    isClosed: zod_1.z.boolean().optional()
}).refine(data => {
    if (data.is24Hours || data.isClosed)
        return true;
    return data.openingTime && data.closingTime;
}, {
    message: "Either provide opening/closing times or mark as 24 hours/closed",
    path: []
});
const facilitiesSchema = zod_1.z.object({
    parking: zod_1.z.boolean().optional(),
    wifi: zod_1.z.boolean().optional(),
    delivery: zod_1.z.boolean().optional(),
    pickup: zod_1.z.boolean().optional(),
    dining: zod_1.z.boolean().optional(),
    atm: zod_1.z.boolean().optional(),
    pharmacy: zod_1.z.boolean().optional(),
    bakery: zod_1.z.boolean().optional()
});
const createBranchValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, { message: "Branch name is required" }),
        code: zod_1.z.string().min(1, { message: "Branch code is required" }),
        status: zod_1.z.enum(Object.keys(branchConstant_1.BRANCH_STATUS)).optional(),
        type: zod_1.z.enum(Object.keys(branchConstant_1.BRANCH_TYPE), {
            required_error: "Branch type is required"
        }),
        contact: contactSchema,
        location: locationSchema,
        operatingHours: zod_1.z.array(operatingHoursSchema).min(1, {
            message: "At least one operating hours entry is required"
        }),
        facilities: facilitiesSchema.optional(),
        openingDate: zod_1.z.coerce.date(),
        size: zod_1.z.number().min(0).optional(),
        employeeCount: zod_1.z.number().min(0).optional(),
        description: zod_1.z.string().optional(),
        images: zod_1.z.array(zod_1.z.string().url()).optional()
    })
});
const updateBranchValidationSchema = zod_1.z.object({
    body: createBranchValidationSchema.shape.body.partial()
        .refine(data => Object.keys(data).length > 0, {
        message: "At least one field must be provided",
        path: []
    })
});
const nearbyBranchesValidationSchema = zod_1.z.object({
    query: zod_1.z.object({
        lat: zod_1.z.coerce.number().min(-90).max(90),
        lng: zod_1.z.coerce.number().min(-180).max(180),
        maxDistance: zod_1.z.coerce.number().min(1).default(10),
        limit: zod_1.z.coerce.number().min(1).max(100).default(5)
    })
});
exports.BranchValidation = {
    createBranchValidationSchema,
    updateBranchValidationSchema,
    nearbyBranchesValidationSchema
};
//# sourceMappingURL=branchValidation.js.map
import { z } from "zod";
import { BRANCH_STATUS, BRANCH_TYPE, OPERATING_HOURS } from "../constants/branchConstant";

const contactSchema = z.object({
  phone: z.string().min(1, { message: "Phone number is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  manager: z.string().optional(),
  emergencyContact: z.string().optional()
});

const locationSchema = z.object({
  address: z.string().min(1, { message: "Address is required" }),
  city: z.string().min(1, { message: "City is required" }),
  state: z.string().min(1, { message: "State is required" }),
  country: z.string().min(1, { message: "Country is required" }),
  postalCode: z.string().min(1, { message: "Postal code is required" }),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional()
});

const operatingHoursSchema = z.object({
  dayType: z.enum(Object.keys(OPERATING_HOURS) as [keyof typeof OPERATING_HOURS], {
    required_error: "Day type is required"
  }),
  openingTime: z.string().optional(),
  closingTime: z.string().optional(),
  is24Hours: z.boolean().optional(),
  isClosed: z.boolean().optional()
}).refine(data => {
  if (data.is24Hours || data.isClosed) return true;
  return data.openingTime && data.closingTime;
}, {
  message: "Either provide opening/closing times or mark as 24 hours/closed",
  path: []
});

const facilitiesSchema = z.object({
  parking: z.boolean().optional(),
  wifi: z.boolean().optional(),
  delivery: z.boolean().optional(),
  pickup: z.boolean().optional(),
  dining: z.boolean().optional(),
  atm: z.boolean().optional(),
  pharmacy: z.boolean().optional(),
  bakery: z.boolean().optional()
});

const createBranchValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, { message: "Branch name is required" }),
    code: z.string().min(1, { message: "Branch code is required" }),
    status: z.enum(Object.keys(BRANCH_STATUS) as [keyof typeof BRANCH_STATUS]).optional(),
    type: z.enum(Object.keys(BRANCH_TYPE) as [keyof typeof BRANCH_TYPE], {
      required_error: "Branch type is required"
    }),
    contact: contactSchema,
    location: locationSchema,
    operatingHours: z.array(operatingHoursSchema).min(1, {
      message: "At least one operating hours entry is required"
    }),
    facilities: facilitiesSchema.optional(),
    openingDate: z.coerce.date(),
    size: z.number().min(0).optional(),
    employeeCount: z.number().min(0).optional(),
    description: z.string().optional(),
    images: z.array(z.string().url()).optional()
  })
});

const updateBranchValidationSchema = z.object({
  body: createBranchValidationSchema.shape.body.partial()
    .refine(data => Object.keys(data).length > 0, {
      message: "At least one field must be provided",
      path: []
    })
});

const nearbyBranchesValidationSchema = z.object({
  query: z.object({
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
    maxDistance: z.coerce.number().min(1).default(10),
    limit: z.coerce.number().min(1).max(100).default(5)
  })
});

export const BranchValidation = {
  createBranchValidationSchema,
  updateBranchValidationSchema,
  nearbyBranchesValidationSchema
};
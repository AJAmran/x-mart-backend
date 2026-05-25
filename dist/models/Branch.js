"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Branch = void 0;
const mongoose_1 = require("mongoose");
const branchConstant_1 = require("../constants/branchConstant");
const contactSchema = new mongoose_1.Schema({
    phone: { type: String, required: true },
    email: { type: String, required: true },
    manager: { type: String },
    emergencyContact: { type: String },
});
const locationSchema = new mongoose_1.Schema({
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String, required: true },
    coordinates: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },
});
const operatingHoursSchema = new mongoose_1.Schema({
    dayType: { type: String, required: true },
    openingTime: { type: String },
    closingTime: { type: String },
    is24Hours: { type: Boolean, default: false },
    isClosed: { type: Boolean, default: false },
});
const facilitiesSchema = new mongoose_1.Schema({
    parking: { type: Boolean, default: false },
    wifi: { type: Boolean, default: false },
    delivery: { type: Boolean, default: false },
    pickup: { type: Boolean, default: false },
    dining: { type: Boolean, default: false },
    atm: { type: Boolean, default: false },
    pharmacy: { type: Boolean, default: false },
    bakery: { type: Boolean, default: false },
});
const branchSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true, index: true },
    code: { type: String, required: true, unique: true, index: true },
    status: {
        type: String,
        enum: Object.keys(branchConstant_1.BRANCH_STATUS),
        default: "ACTIVE",
        index: true,
    },
    type: {
        type: String,
        enum: Object.keys(branchConstant_1.BRANCH_TYPE),
        required: true,
        index: true,
    },
    contact: { type: contactSchema, required: true },
    location: { type: locationSchema, required: true },
    operatingHours: { type: [operatingHoursSchema], required: true },
    facilities: { type: facilitiesSchema, default: {} },
    openingDate: { type: Date, required: true },
    size: { type: Number },
    employeeCount: { type: Number },
    description: { type: String },
    images: { type: [String] },
}, { timestamps: true });
// Indexes for geospatial queries
branchSchema.index({ "location.coordinates": "2dsphere" });
branchSchema.index({ "location.city": 1, "location.state": 1 });
exports.Branch = (0, mongoose_1.model)("Branch", branchSchema);
//# sourceMappingURL=Branch.js.map
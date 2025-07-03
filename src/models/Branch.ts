import { model, Schema } from "mongoose";
import { TBranch } from "../interface/branchInterface";
import { BRANCH_STATUS, BRANCH_TYPE } from "../constants/branchConstant";

const contactSchema = new Schema({
  phone: { type: String, required: true },
  email: { type: String, required: true },
  manager: { type: String },
  emergencyContact: { type: String }
});


const locationSchema = new Schema({
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  postalCode: { type: String, required: true },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  }
});

const operatingHoursSchema = new Schema({
  dayType: { type: String, required: true },
  openingTime: { type: String },
  closingTime: { type: String },
  is24Hours: { type: Boolean, default: false },
  isClosed: { type: Boolean, default: false }
});

const facilitiesSchema = new Schema({
  parking: { type: Boolean, default: false },
  wifi: { type: Boolean, default: false },
  delivery: { type: Boolean, default: false },
  pickup: { type: Boolean, default: false },
  dining: { type: Boolean, default: false },
  atm: { type: Boolean, default: false },
  pharmacy: { type: Boolean, default: false },
  bakery: { type: Boolean, default: false }
})


const branchSchema = new Schema<TBranch>(
  {
    name: { type: String, required: true, trim: true, index: true },
    code: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: Object.keys(BRANCH_STATUS) as (keyof typeof BRANCH_STATUS)[],
      default: "ACTIVE",
      index: true
    },
    type: {
      type: String,
      enum: Object.keys(BRANCH_TYPE) as (keyof typeof BRANCH_TYPE)[],
      required: true,
      index: true
    },
    contact: { type: contactSchema, required: true },
    location: { type: locationSchema, required: true },
    operatingHours: { type: [operatingHoursSchema], required: true },
    facilities: { type: facilitiesSchema, default: {} },
    openingDate: { type: Date, required: true },
    size: { type: Number },
    employeeCount: { type: Number },
    description: { type: String },
    images: { type: [String] }
  },
  { timestamps: true }
);


// Indexes for geospatial queries
branchSchema.index({ "location.coordinates": "2dsphere" });
branchSchema.index({ "location.city": 1, "location.state": 1 });


export const Branch = model<TBranch>("Branch", branchSchema);
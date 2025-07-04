import {
  BRANCH_STATUS,
  BRANCH_TYPE,
  OPERATING_HOURS,
} from "../constants/branchConstant";

export type TBranchContact = {
  phone: string;
  email: string;
  manager?: string;
  emergencyContact?: string;
};

export type TBranchLocation = {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  coordinates?: {
    type: "Point";
    coordinates: [number, number];
  };
};

export type TBranchOperatingHours = {
  dayType: keyof typeof OPERATING_HOURS;
  openingTime: string;
  closingTime: string;
  is24Hours?: boolean;
  isClosed?: boolean;
};

export type TBranchFacilities = {
  parking?: boolean;
  wifi: boolean;
  delivery: boolean;
  pickup: boolean;
  dining: boolean;
  atm: boolean;
  pharmacy?: boolean;
  bakery?: boolean;
};

export type TBranch = {
  name: string;
  code: string;
  status: keyof typeof BRANCH_STATUS;
  type: keyof typeof BRANCH_TYPE;
  contact: TBranchContact;
  location: TBranchLocation;
  operatingHours: TBranchOperatingHours[];
  facilities?: TBranchFacilities;
  openingDate: Date;
  size?: number;
  employeeCount?: number;
  description?: string;
  images?: string[];
  createdAt?: Date;
  updatedAt?: Date;
};

export type BranchFilters = {
  searchTerm?: string;
  status?: string;
  type?: string;
  city?: string;
  state?: string;
};

export type PaginationOptions = {
  limit?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: 1 | -1;
};

export const BRANCH_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  MAINTENANCE: "maintenance",
} as const;

export const BRANCH_TYPE = {
  STANDARD: "standard",
  FLAGSHIP: "flagship",
  EXPRESS: "express",
  WAREHOUSE: "warehouse",
} as const;

export const OPERATING_HOURS = {
  WEEKDAYS: "weekdays",
  WEEKENDS: "weekends",
  HOLIDAYS: "holidays",
} as const;

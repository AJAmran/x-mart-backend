export const PRODUCT_CATEGORY = {
  FISH: "fish",
  MEAT: "meat",
  FRUITS: "fruits",
  VEGETABLES: "vegetables",
  DAIRY: "dairy",
  FROZEN: "frozen",
  GROCERY: "grocery",
  PERSONALCARE: "personalcare",
  HOUSEHOLD: "household",
  STATIONERY: "stationery",
} as const;

export const PRODUCT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  OUT_OF_STOCK: "out_of_stock",
  COMING_SOON: "coming_soon",
} as const;

export const PRODUCT_AVAILABILITY = {
  ALL_BRANCHES: "all_branches",
  SELECTED_BRANCHES: "selected_branches",
  ONLINE_ONLY: "online_only",
} as const;

export const PRODUCT_OPERATION_TYPES = {
  REGULAR: "regular",
  PROMOTIONAL: "promotional",
  SEASONAL: "seasonal",
  LIMITED_EDITION: "limited_edition",
} as const;
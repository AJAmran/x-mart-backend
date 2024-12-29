import dotevnt from "dotenv";

dotevnt.config();

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.DB_URL || "",
};

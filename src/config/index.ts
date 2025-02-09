import dotenv from "dotenv";

dotenv.config();

export default {
  NODE_ENV:process.env.NODE_ENV,
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI as string,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUND as string,
  jwtSecret: process.env.JWT_SECRET as string,
  refreshSecret: process.env.JWT_REFRESH_SECRET as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
};

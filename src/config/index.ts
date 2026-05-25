import dotenv from "dotenv";

dotenv.config();


export default {
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT,
  mongoUri: process.env.MONGO_URI,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUND,
  jwtSecret: process.env.JWT_SECRET || "fallback-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  refreshSecret: process.env.JWT_REFRESH_SECRET || "fallback-refresh-secret",
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
  sslStoreId: process.env.SSL_STORE_ID,
  sslStorePassword: process.env.SSL_STORE_PASSWORD,
  backendUrl: process.env.BACKEND_URL || "http://localhost:5000",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
};

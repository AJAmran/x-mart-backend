"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Fail fast if critical secrets are missing — never use fallback values in production.
const requireEnv = (key) => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
};
const requireEnvInProd = (key) => {
    if (process.env.NODE_ENV === "production" && !process.env[key]) {
        throw new Error(`Missing required environment variable in production: ${key}`);
    }
    return process.env[key];
};
exports.default = {
    nodeEnv: process.env.NODE_ENV ?? "development",
    port: process.env.PORT ?? "5000",
    mongoUri: requireEnv("MONGO_URI"),
    bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUND ?? "12",
    jwtSecret: requireEnv("JWT_SECRET"),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "15m",
    refreshSecret: requireEnv("JWT_REFRESH_SECRET"),
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "30d",
    cloudinary_cloud_name: requireEnvInProd("CLOUDINARY_CLOUD_NAME"),
    cloudinary_api_key: requireEnvInProd("CLOUDINARY_API_KEY"),
    cloudinary_api_secret: requireEnvInProd("CLOUDINARY_API_SECRET"),
    sslStoreId: process.env.Store_ID,
    sslStorePassword: process.env.Store_Password,
    // Defaults to the sandbox so a fresh install has a working checkout instead
    // of `undefined`, which produced a confusing gateway error only once a real
    // customer tried to pay. Switch to https://securepay.sslcommerz.com for live.
    SSL_COMMERCE_URL: process.env.SSL_COMMERCE_URL ?? "https://sandbox.sslcommerz.com",
    backendUrl: process.env.BACKEND_URL ?? "http://localhost:5000",
    clientUrl: process.env.CLIENT_URL ?? "http://localhost:3000",
    cronSecret: process.env.CRON_SECRET,
    adminEmail: process.env.ADMIN_EMAIL,
    adminPassword: process.env.ADMIN_PASSWORD,
    adminProfilePhoto: process.env.ADMIN_PROFILE_PHOTO,
    adminMobileNumber: process.env.ADMIN_MOBILE_NUMBER,
};
//# sourceMappingURL=index.js.map
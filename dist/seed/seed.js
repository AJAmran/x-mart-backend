"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = __importDefault(require("../config"));
const User_1 = require("../models/User");
const userConstant_1 = require("../constants/userConstant");
const logger_1 = require("../utils/logger");
const SAMPLE_USERS = [
    {
        name: "Rafiq Hasan",
        email: "rafiq.hasan@example.com",
        password: "User@123",
        mobileNumber: "+8801700000001",
        role: userConstant_1.USER_ROLE.USER,
        status: userConstant_1.USER_STATUS.ACTIVE,
    },
    {
        name: "Shamima Akhter",
        email: "shamima.akhter@example.com",
        password: "User@123",
        mobileNumber: "+8801700000002",
        role: userConstant_1.USER_ROLE.USER,
        status: userConstant_1.USER_STATUS.ACTIVE,
    },
    {
        name: "Kabir Hossain",
        email: "kabir.hossain@example.com",
        password: "User@123",
        mobileNumber: "+8801700000003",
        role: userConstant_1.USER_ROLE.USER,
        status: userConstant_1.USER_STATUS.ACTIVE,
    },
    {
        name: "Nusrat Jahan",
        email: "nusrat.jahan@example.com",
        password: "User@123",
        mobileNumber: "+8801700000004",
        role: userConstant_1.USER_ROLE.USER,
        status: userConstant_1.USER_STATUS.ACTIVE,
    },
    {
        name: "Tanvir Ahmed",
        email: "tanvir.ahmed@example.com",
        password: "User@123",
        mobileNumber: "+8801700000005",
        role: userConstant_1.USER_ROLE.USER,
        status: userConstant_1.USER_STATUS.BLOCKED,
    },
    {
        name: "Farzana Begum",
        email: "farzana.begum@example.com",
        password: "User@123",
        mobileNumber: "+8801700000006",
        role: userConstant_1.USER_ROLE.USER,
        status: userConstant_1.USER_STATUS.ACTIVE,
    },
    {
        name: "Jahidul Islam",
        email: "jahidul.islam@example.com",
        password: "User@123",
        mobileNumber: "+8801700000007",
        role: userConstant_1.USER_ROLE.USER,
        status: userConstant_1.USER_STATUS.ACTIVE,
    },
    {
        name: "Sadia Rahman",
        email: "sadia.rahman@example.com",
        password: "User@123",
        mobileNumber: "+8801700000008",
        role: userConstant_1.USER_ROLE.USER,
        status: userConstant_1.USER_STATUS.ACTIVE,
    },
    {
        name: "Mizanur Rahman",
        email: "mizanur.rahman@example.com",
        password: "User@123",
        mobileNumber: "+8801700000009",
        role: userConstant_1.USER_ROLE.USER,
        status: userConstant_1.USER_STATUS.BLOCKED,
    },
    {
        name: "Taslima Khatun",
        email: "taslima.khatun@example.com",
        password: "User@123",
        mobileNumber: "+8801700000010",
        role: userConstant_1.USER_ROLE.USER,
        status: userConstant_1.USER_STATUS.ACTIVE,
    },
    {
        name: "Riaz Uddin",
        email: "riaz.uddin@example.com",
        password: "User@123",
        mobileNumber: "+8801700000011",
        role: userConstant_1.USER_ROLE.ADMIN,
        status: userConstant_1.USER_STATUS.ACTIVE,
    },
    {
        name: "Shahana Parvin",
        email: "shahana.parvin@example.com",
        password: "User@123",
        mobileNumber: "+8801700000012",
        role: userConstant_1.USER_ROLE.USER,
        status: userConstant_1.USER_STATUS.ACTIVE,
    },
    {
        name: "Imran Khan",
        email: "imran.khan@example.com",
        password: "User@123",
        mobileNumber: "+8801700000013",
        role: userConstant_1.USER_ROLE.USER,
        status: userConstant_1.USER_STATUS.ACTIVE,
    },
    {
        name: "Maliha Tabassum",
        email: "maliha.tabassum@example.com",
        password: "User@123",
        mobileNumber: "+8801700000014",
        role: userConstant_1.USER_ROLE.USER,
        status: userConstant_1.USER_STATUS.ACTIVE,
    },
    {
        name: "Shahidul Alam",
        email: "shahidul.alam@example.com",
        password: "User@123",
        mobileNumber: "+8801700000015",
        role: userConstant_1.USER_ROLE.USER,
        status: userConstant_1.USER_STATUS.ACTIVE,
    },
    {
        name: "Rokeya Sultana",
        email: "rokeya.sultana@example.com",
        password: "User@123",
        mobileNumber: "+8801700000016",
        role: userConstant_1.USER_ROLE.USER,
        status: userConstant_1.USER_STATUS.BLOCKED,
    },
    {
        name: "Fahim Mahmud",
        email: "fahim.mahmud@example.com",
        password: "User@123",
        mobileNumber: "+8801700000017",
        role: userConstant_1.USER_ROLE.USER,
        status: userConstant_1.USER_STATUS.ACTIVE,
    },
    {
        name: "Nargis Akhter",
        email: "nargis.akhter@example.com",
        password: "User@123",
        mobileNumber: "+8801700000018",
        role: userConstant_1.USER_ROLE.USER,
        status: userConstant_1.USER_STATUS.ACTIVE,
    },
    {
        name: "Shakil Ahmed",
        email: "shakil.ahmed@example.com",
        password: "User@123",
        mobileNumber: "+8801700000019",
        role: userConstant_1.USER_ROLE.USER,
        status: userConstant_1.USER_STATUS.ACTIVE,
    },
    {
        name: "Laily Begum",
        email: "laily.begum@example.com",
        password: "User@123",
        mobileNumber: "+8801700000020",
        role: userConstant_1.USER_ROLE.USER,
        status: userConstant_1.USER_STATUS.ACTIVE,
    },
];
function getAdminData() {
    const email = config_1.default.adminEmail;
    const password = config_1.default.adminPassword;
    const mobileNumber = config_1.default.adminMobileNumber;
    const profilePhoto = config_1.default.adminProfilePhoto;
    if (!email || !password) {
        throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables");
    }
    return {
        name: "Super Admin",
        email: email.toLowerCase(),
        password,
        mobileNumber: mobileNumber || "+8801999999999",
        profilePhoto: profilePhoto || null,
        role: userConstant_1.USER_ROLE.ADMIN,
        status: userConstant_1.USER_STATUS.ACTIVE,
    };
}
async function seedAdmin() {
    const adminData = getAdminData();
    const existing = await User_1.User.findOne({ email: adminData.email });
    if (existing) {
        await User_1.User.findByIdAndUpdate(existing._id, {
            name: adminData.name,
            profilePhoto: adminData.profilePhoto,
            mobileNumber: adminData.mobileNumber,
        });
        logger_1.logger.info({ email: adminData.email }, "Admin already exists — updated profile");
        return;
    }
    await User_1.User.create(adminData);
    logger_1.logger.info({ email: adminData.email }, "Admin user created");
}
async function seedSampleUsers() {
    const existingCount = await User_1.User.countDocuments({ role: userConstant_1.USER_ROLE.USER });
    if (existingCount >= SAMPLE_USERS.length) {
        logger_1.logger.info({ count: existingCount }, "Sample users already seeded — skipping");
        return;
    }
    const existingEmails = await User_1.User.find({
        email: { $in: SAMPLE_USERS.map((u) => u.email) },
    }).distinct("email");
    const existingSet = new Set(existingEmails.map((e) => e.toLowerCase()));
    const newUsers = SAMPLE_USERS.filter((u) => !existingSet.has(u.email.toLowerCase()));
    if (newUsers.length === 0) {
        logger_1.logger.info("All sample users already exist — skipping");
        return;
    }
    const salt = await bcryptjs_1.default.genSalt(Number(config_1.default.bcrypt_salt_rounds));
    const hashedPassword = await bcryptjs_1.default.hash(newUsers[0].password, salt);
    const payload = newUsers.map((u) => ({
        ...u,
        email: u.email.toLowerCase(),
        password: hashedPassword,
    }));
    await User_1.User.insertMany(payload, { ordered: false });
    logger_1.logger.info({ count: newUsers.length }, "Sample users seeded");
}
async function seed() {
    const start = performance.now();
    const args = process.argv.slice(2);
    const seedAdminOnly = args.includes("--admin");
    const seedUsersOnly = args.includes("--users");
    const seedAll = !seedAdminOnly && !seedUsersOnly;
    try {
        if (!config_1.default.mongoUri) {
            throw new Error("MONGO_URI is not configured");
        }
        await mongoose_1.default.connect(config_1.default.mongoUri, {
            maxPoolSize: 5,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 30000,
            autoIndex: false,
        });
        logger_1.logger.info("Connected to database for seeding");
        if (seedAll || seedAdminOnly) {
            await seedAdmin();
        }
        if (seedAll || seedUsersOnly) {
            await seedSampleUsers();
        }
        const elapsed = ((performance.now() - start) / 1000).toFixed(2);
        logger_1.logger.info({ elapsed: `${elapsed}s` }, "Seeding complete");
    }
    catch (error) {
        logger_1.logger.error({ err: error }, "Seeding failed");
        process.exit(1);
    }
    finally {
        await mongoose_1.default.disconnect();
        logger_1.logger.info("Database disconnected");
    }
}
seed();
//# sourceMappingURL=seed.js.map
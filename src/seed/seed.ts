import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import config from "../config";
import { User } from "../models/User";
import { USER_ROLE, USER_STATUS } from "../constants/userConstant";
import { logger } from "../utils/logger";

const SAMPLE_USERS = [
  {
    name: "Rafiq Hasan",
    email: "rafiq.hasan@example.com",
    password: "User@123",
    mobileNumber: "+8801700000001",
    role: USER_ROLE.USER,
    status: USER_STATUS.ACTIVE,
  },
  {
    name: "Shamima Akhter",
    email: "shamima.akhter@example.com",
    password: "User@123",
    mobileNumber: "+8801700000002",
    role: USER_ROLE.USER,
    status: USER_STATUS.ACTIVE,
  },
  {
    name: "Kabir Hossain",
    email: "kabir.hossain@example.com",
    password: "User@123",
    mobileNumber: "+8801700000003",
    role: USER_ROLE.USER,
    status: USER_STATUS.ACTIVE,
  },
  {
    name: "Nusrat Jahan",
    email: "nusrat.jahan@example.com",
    password: "User@123",
    mobileNumber: "+8801700000004",
    role: USER_ROLE.USER,
    status: USER_STATUS.ACTIVE,
  },
  {
    name: "Tanvir Ahmed",
    email: "tanvir.ahmed@example.com",
    password: "User@123",
    mobileNumber: "+8801700000005",
    role: USER_ROLE.USER,
    status: USER_STATUS.BLOCKED,
  },
  {
    name: "Farzana Begum",
    email: "farzana.begum@example.com",
    password: "User@123",
    mobileNumber: "+8801700000006",
    role: USER_ROLE.USER,
    status: USER_STATUS.ACTIVE,
  },
  {
    name: "Jahidul Islam",
    email: "jahidul.islam@example.com",
    password: "User@123",
    mobileNumber: "+8801700000007",
    role: USER_ROLE.USER,
    status: USER_STATUS.ACTIVE,
  },
  {
    name: "Sadia Rahman",
    email: "sadia.rahman@example.com",
    password: "User@123",
    mobileNumber: "+8801700000008",
    role: USER_ROLE.USER,
    status: USER_STATUS.ACTIVE,
  },
  {
    name: "Mizanur Rahman",
    email: "mizanur.rahman@example.com",
    password: "User@123",
    mobileNumber: "+8801700000009",
    role: USER_ROLE.USER,
    status: USER_STATUS.BLOCKED,
  },
  {
    name: "Taslima Khatun",
    email: "taslima.khatun@example.com",
    password: "User@123",
    mobileNumber: "+8801700000010",
    role: USER_ROLE.USER,
    status: USER_STATUS.ACTIVE,
  },
  {
    name: "Riaz Uddin",
    email: "riaz.uddin@example.com",
    password: "User@123",
    mobileNumber: "+8801700000011",
    role: USER_ROLE.ADMIN,
    status: USER_STATUS.ACTIVE,
  },
  {
    name: "Shahana Parvin",
    email: "shahana.parvin@example.com",
    password: "User@123",
    mobileNumber: "+8801700000012",
    role: USER_ROLE.USER,
    status: USER_STATUS.ACTIVE,
  },
  {
    name: "Imran Khan",
    email: "imran.khan@example.com",
    password: "User@123",
    mobileNumber: "+8801700000013",
    role: USER_ROLE.USER,
    status: USER_STATUS.ACTIVE,
  },
  {
    name: "Maliha Tabassum",
    email: "maliha.tabassum@example.com",
    password: "User@123",
    mobileNumber: "+8801700000014",
    role: USER_ROLE.USER,
    status: USER_STATUS.ACTIVE,
  },
  {
    name: "Shahidul Alam",
    email: "shahidul.alam@example.com",
    password: "User@123",
    mobileNumber: "+8801700000015",
    role: USER_ROLE.USER,
    status: USER_STATUS.ACTIVE,
  },
  {
    name: "Rokeya Sultana",
    email: "rokeya.sultana@example.com",
    password: "User@123",
    mobileNumber: "+8801700000016",
    role: USER_ROLE.USER,
    status: USER_STATUS.BLOCKED,
  },
  {
    name: "Fahim Mahmud",
    email: "fahim.mahmud@example.com",
    password: "User@123",
    mobileNumber: "+8801700000017",
    role: USER_ROLE.USER,
    status: USER_STATUS.ACTIVE,
  },
  {
    name: "Nargis Akhter",
    email: "nargis.akhter@example.com",
    password: "User@123",
    mobileNumber: "+8801700000018",
    role: USER_ROLE.USER,
    status: USER_STATUS.ACTIVE,
  },
  {
    name: "Shakil Ahmed",
    email: "shakil.ahmed@example.com",
    password: "User@123",
    mobileNumber: "+8801700000019",
    role: USER_ROLE.USER,
    status: USER_STATUS.ACTIVE,
  },
  {
    name: "Laily Begum",
    email: "laily.begum@example.com",
    password: "User@123",
    mobileNumber: "+8801700000020",
    role: USER_ROLE.USER,
    status: USER_STATUS.ACTIVE,
  },
];

function getAdminData() {
  const email = config.adminEmail;
  const password = config.adminPassword;
  const mobileNumber = config.adminMobileNumber;
  const profilePhoto = config.adminProfilePhoto;

  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables"
    );
  }

  return {
    name: "Super Admin",
    email: email.toLowerCase(),
    password,
    mobileNumber: mobileNumber || "+8801999999999",
    profilePhoto: profilePhoto || null,
    role: USER_ROLE.ADMIN,
    status: USER_STATUS.ACTIVE,
  };
}

async function seedAdmin(): Promise<void> {
  const adminData = getAdminData();
  const existing = await User.findOne({ email: adminData.email });

  if (existing) {
    await User.findByIdAndUpdate(existing._id, {
      name: adminData.name,
      profilePhoto: adminData.profilePhoto,
      mobileNumber: adminData.mobileNumber,
    });
    logger.info({ email: adminData.email }, "Admin already exists — updated profile");
    return;
  }

  await User.create(adminData);
  logger.info({ email: adminData.email }, "Admin user created");
}

async function seedSampleUsers(): Promise<void> {
  const existingCount = await User.countDocuments({ role: USER_ROLE.USER });
  if (existingCount >= SAMPLE_USERS.length) {
    logger.info(
      { count: existingCount },
      "Sample users already seeded — skipping"
    );
    return;
  }

  const existingEmails = await User.find({
    email: { $in: SAMPLE_USERS.map((u) => u.email) },
  }).distinct("email");
  const existingSet = new Set(existingEmails.map((e: string) => e.toLowerCase()));

  const newUsers = SAMPLE_USERS.filter(
    (u) => !existingSet.has(u.email.toLowerCase())
  );

  if (newUsers.length === 0) {
    logger.info("All sample users already exist — skipping");
    return;
  }

  const salt = await bcrypt.genSalt(Number(config.bcrypt_salt_rounds));
  const hashedPassword = await bcrypt.hash(newUsers[0].password, salt);

  const payload = newUsers.map((u) => ({
    ...u,
    email: u.email.toLowerCase(),
    password: hashedPassword,
  }));

  await User.insertMany(payload, { ordered: false });
  logger.info({ count: newUsers.length }, "Sample users seeded");
}

async function seed(): Promise<void> {
  const start = performance.now();

  const args = process.argv.slice(2);
  const seedAdminOnly = args.includes("--admin");
  const seedUsersOnly = args.includes("--users");
  const seedAll = !seedAdminOnly && !seedUsersOnly;

  try {
    if (!config.mongoUri) {
      throw new Error("MONGO_URI is not configured");
    }

    await mongoose.connect(config.mongoUri, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      autoIndex: false,
    } as mongoose.ConnectOptions);

    logger.info("Connected to database for seeding");

    if (seedAll || seedAdminOnly) {
      await seedAdmin();
    }

    if (seedAll || seedUsersOnly) {
      await seedSampleUsers();
    }

    const elapsed = ((performance.now() - start) / 1000).toFixed(2);
    logger.info({ elapsed: `${elapsed}s` }, "Seeding complete");
  } catch (error) {
    logger.error({ err: error }, "Seeding failed");
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    logger.info("Database disconnected");
  }
}

seed();

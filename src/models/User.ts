/* eslint-disable no-useless-escape */
import bcrypt from "bcryptjs";
import { model, Schema } from "mongoose";
import { IUserModel, TUser } from "../interface/userInterface";
import { USER_ROLE, USER_STATUS } from "../constants/userConstant";
import config from "../config";

const userSchema = new Schema<TUser, IUserModel>(
  {
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: Object.keys(USER_ROLE),
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [
        /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
        "Please fill a valid email address",
      ],
    },
    password: { type: String, required: true, select: 0 },
    status: {
      type: String,
      enum: Object.keys(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },
    passwordChangedAt: { type: Date },
    mobileNumber: { type: String, required: true, unique: true, trim: true },
    profilePhoto: { type: String, default: null },
  },
  { timestamps: true, virtuals: true }
);

// Production indexes
userSchema.index({ email: 1 }, { unique: true });
  // `mobileNumber` already declares `unique: true`, which creates the index.
  // Repeating it here triggered Mongoose's "Duplicate schema index" warning.
  userSchema.index({ role: 1, status: 1 });

userSchema.pre("save", async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  if (!user.isModified("password")) return next();
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds)
  );
  next();
});

userSchema.post("save", function (doc, next) {
  doc.password = "";
  next();
});

userSchema.statics.isUserExistsByEmail = async function (email: string) {
  return User.findOne({ email: email.toLowerCase() }).select("+password");
};

userSchema.statics.isUserExistsById = async function (id: string) {
  return User.findById(id).select("+password");
};

userSchema.statics.isPasswordMatched = async function (
  plainTextPassword: string,
  hashedPassword: string
) {
  return bcrypt.compare(plainTextPassword, hashedPassword);
};

userSchema.statics.isJWTIssuedBeforePasswordChanged = function (
  passwordChangedTimestamp: Date,
  jwtIssuedTimestamp: number
) {
  // Fix the off-by-one: tokens issued in the same second as the password change
  // must be considered still valid.
  const passwordChangedTime = passwordChangedTimestamp.getTime() / 1000;
  return passwordChangedTime > jwtIssuedTimestamp;
};

export const User = model<TUser, IUserModel>("User", userSchema);

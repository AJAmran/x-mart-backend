"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
/* eslint-disable no-useless-escape */
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = require("mongoose");
const userConstant_1 = require("../constants/userConstant");
const config_1 = __importDefault(require("../config"));
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    role: {
        type: String,
        enum: Object.keys(userConstant_1.USER_ROLE),
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
        enum: Object.keys(userConstant_1.USER_STATUS),
        default: userConstant_1.USER_STATUS.ACTIVE,
    },
    passwordChangedAt: { type: Date },
    mobileNumber: { type: String, required: true, unique: true, trim: true },
    profilePhoto: { type: String, default: null },
}, { timestamps: true, virtuals: true });
// Production indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ mobileNumber: 1 }, { unique: true });
userSchema.index({ role: 1, status: 1 });
userSchema.pre("save", async function (next) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const user = this;
    if (!user.isModified("password"))
        return next();
    user.password = await bcryptjs_1.default.hash(user.password, Number(config_1.default.bcrypt_salt_rounds));
    next();
});
userSchema.post("save", function (doc, next) {
    doc.password = "";
    next();
});
userSchema.statics.isUserExistsByEmail = async function (email) {
    return exports.User.findOne({ email: email.toLowerCase() }).select("+password");
};
userSchema.statics.isUserExistsById = async function (id) {
    return exports.User.findById(id).select("+password");
};
userSchema.statics.isPasswordMatched = async function (plainTextPassword, hashedPassword) {
    return bcryptjs_1.default.compare(plainTextPassword, hashedPassword);
};
userSchema.statics.isJWTIssuedBeforePasswordChanged = function (passwordChangedTimestamp, jwtIssuedTimestamp) {
    // Fix the off-by-one: tokens issued in the same second as the password change
    // must be considered still valid.
    const passwordChangedTime = passwordChangedTimestamp.getTime() / 1000;
    return passwordChangedTime > jwtIssuedTimestamp;
};
exports.User = (0, mongoose_1.model)("User", userSchema);
//# sourceMappingURL=User.js.map
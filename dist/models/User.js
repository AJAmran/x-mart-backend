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
    name: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: Object.keys(userConstant_1.USER_ROLE),
        required: true,
    },
    email: {
        type: String,
        required: true,
        //validate email
        match: [
            /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
            "Please fill a valid email address",
        ],
    },
    password: {
        type: String,
        required: true,
        select: 0,
    },
    status: {
        type: String,
        enum: Object.keys(userConstant_1.USER_STATUS),
        default: userConstant_1.USER_STATUS.ACTIVE,
    },
    passwordChangedAt: {
        type: Date,
    },
    mobileNumber: {
        type: String,
        required: true,
    },
    profilePhoto: {
        type: String,
        default: null,
    },
}, {
    timestamps: true,
    virtuals: true,
});
// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.pre('save', async function (next) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const user = this; // doc
    // hashing password and save into DB
    user.password = await bcryptjs_1.default.hash(user.password, Number(config_1.default.bcrypt_salt_rounds));
    next();
});
// set '' after saving password
userSchema.post("save", function (doc, next) {
    doc.password = "";
    next();
});
userSchema.statics.isUserExistsByEmail = async function (email) {
    return await exports.User.findOne({ email }).select("+password");
};
userSchema.statics.isPasswordMatched = async function (plainTextPassword, hashedPassword) {
    return await bcryptjs_1.default.compare(plainTextPassword, hashedPassword);
};
userSchema.statics.isJWTIssuedBeforePasswordChanged = function (passwordChangedTimestamp, jwtIssuedTimestamp) {
    const passwordChangedTime = new Date(passwordChangedTimestamp).getTime() / 1000;
    return passwordChangedTime > jwtIssuedTimestamp;
};
exports.User = (0, mongoose_1.model)("User", userSchema);
//# sourceMappingURL=User.js.map
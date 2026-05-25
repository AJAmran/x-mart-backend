"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const User_1 = require("../models/User");
class UserRepository {
    async findAll(filters, options) {
        const { page, limit, sortBy, sortOrder } = options;
        const query = {};
        if (filters.search) {
            query.$or = [
                { name: { $regex: filters.search, $options: "i" } },
                { email: { $regex: filters.search, $options: "i" } },
                { mobileNumber: { $regex: filters.search, $options: "i" } },
            ];
        }
        if (filters.status)
            query.status = filters.status.toUpperCase();
        if (filters.role)
            query.role = filters.role.toUpperCase();
        const [data, total] = await Promise.all([
            User_1.User.find(query)
                .select("-password -passwordChangedAt")
                .sort({ [sortBy]: sortOrder })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            User_1.User.countDocuments(query),
        ]);
        return {
            data,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async findById(id) {
        return User_1.User.findById(id).select("-password -passwordChangedAt").lean();
    }
    async findByEmail(email) {
        return User_1.User.findOne({ email }).select("+password").lean();
    }
    async create(data) {
        const doc = await User_1.User.create(data);
        return doc.toObject();
    }
    async update(id, data) {
        return User_1.User.findByIdAndUpdate(id, data, { new: true, runValidators: true })
            .select("-password -passwordChangedAt")
            .lean();
    }
    async delete(id) {
        return User_1.User.findByIdAndDelete(id).lean();
    }
    async updateStatus(id, status) {
        return User_1.User.findByIdAndUpdate(id, { status }, { new: true })
            .select("-password -passwordChangedAt")
            .lean();
    }
    async updateRole(id, role) {
        return User_1.User.findByIdAndUpdate(id, { role }, { new: true })
            .select("-password -passwordChangedAt")
            .lean();
    }
}
exports.UserRepository = UserRepository;
exports.userRepository = new UserRepository();
//# sourceMappingURL=user.repository.js.map
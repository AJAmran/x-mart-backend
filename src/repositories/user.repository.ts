import { FilterQuery, SortOrder } from "mongoose";
import { User } from "../models/User";
import { TUser } from "../interface/userInterface";

export interface UserFilters {
  search?: string;
  status?: string;
  role?: string;
}

export class UserRepository {
  async findAll(
    filters: UserFilters,
    options: { page: number; limit: number; sortBy: string; sortOrder: SortOrder }
  ): Promise<{ data: TUser[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const { page, limit, sortBy, sortOrder } = options;
    const query: FilterQuery<TUser> = {};

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { email: { $regex: filters.search, $options: "i" } },
        { mobileNumber: { $regex: filters.search, $options: "i" } },
      ];
    }
    if (filters.status) query.status = filters.status.toUpperCase();
    if (filters.role) query.role = filters.role.toUpperCase();

    const [data, total] = await Promise.all([
      User.find(query)
        .select("-password -passwordChangedAt")
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string): Promise<TUser | null> {
    return User.findById(id).select("-password -passwordChangedAt").lean();
  }

  async findByEmail(email: string): Promise<TUser | null> {
    return User.findOne({ email }).select("+password").lean();
  }

  async create(data: Partial<TUser>): Promise<TUser> {
    const doc = await User.create(data);
    return doc.toObject();
  }

  async update(id: string, data: Partial<TUser>): Promise<TUser | null> {
    return User.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .select("-password -passwordChangedAt")
      .lean();
  }

  async delete(id: string): Promise<TUser | null> {
    return User.findByIdAndDelete(id).lean();
  }

  async updateStatus(id: string, status: string): Promise<TUser | null> {
    return User.findByIdAndUpdate(id, { status }, { new: true })
      .select("-password -passwordChangedAt")
      .lean();
  }

  async updateRole(id: string, role: string): Promise<TUser | null> {
    return User.findByIdAndUpdate(id, { role }, { new: true })
      .select("-password -passwordChangedAt")
      .lean();
  }
}

export const userRepository = new UserRepository();

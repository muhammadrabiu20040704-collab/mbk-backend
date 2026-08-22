import { User } from "../users/user.model.js";
import type { PublicProfile, MyProfile, UpdateProfileInput } from "./profile.types.js";
import { AppError } from "../../utils/app-error.js";

export class ProfileService {
  async getPublicProfile(username: string): Promise<PublicProfile> {
    const user = await User.findOne({
      username: username.toLowerCase(),
      isActive: true,
    }).select(
      "fullName username country profilePicture coverPhoto bio school department level isVerified postsCount followersCount followingCount presentationsCount debatesCount coins createdAt",
    );

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return {
      id: user._id.toString(),
      fullName: user.fullName,
      username: user.username,
      country: user.country,
      profilePicture: user.profilePicture,
      coverPhoto: user.coverPhoto,
      bio: user.bio,
      school: user.school,
      department: user.department,
      level: user.level,
      isVerified: user.isVerified,

      stats: {
        postsCount: user.postsCount,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        presentationsCount: user.presentationsCount,
        debatesCount: user.debatesCount,
        coins: user.coins,
      },

      createdAt: user.createdAt,
    };
  }

  async getMyProfile(userId: string): Promise<MyProfile> {
    const user = await User.findOne({
      _id: userId,
      isActive: true,
    }).select(
      "fullName username country profilePicture coverPhoto bio school department level isVerified postsCount followersCount followingCount presentationsCount debatesCount coins createdAt phoneNumberVerified interests role isActive",
    );

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return {
      id: user._id.toString(),
      fullName: user.fullName,
      username: user.username,
      country: user.country,
      profilePicture: user.profilePicture,
      coverPhoto: user.coverPhoto,
      bio: user.bio,
      school: user.school,
      department: user.department,
      level: user.level,
      isVerified: user.isVerified,

      stats: {
        postsCount: user.postsCount,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        presentationsCount: user.presentationsCount,
        debatesCount: user.debatesCount,
        coins: user.coins,
      },

      createdAt: user.createdAt,
      phoneNumberVerified: user.phoneNumberVerified,
      interests: user.interests,
      role: user.role,
      isActive: user.isActive,
    };
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<MyProfile> {
    const user = await User.findOne({
      _id: userId,
      isActive: true,
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Check username uniqueness only when username is being changed
    if (input.username && input.username !== user.username) {
      const existingUser = await User.findOne({
        username: input.username.toLowerCase(),
        _id: { $ne: userId },
      }).select("_id");

      if (existingUser) {
        throw new AppError("Username is already taken", 409);
      }

      user.username = input.username.toLowerCase();
    }

    if (input.bio !== undefined) {
      user.bio = input.bio;
    }

    if (input.school !== undefined) {
      user.school = input.school;
    }

    if (input.department !== undefined) {
      user.department = input.department;
    }

    if (input.level !== undefined) {
      user.level = input.level;
    }

    await user.save();

    return this.getMyProfile(userId);
  }
}

export const profileService = new ProfileService();

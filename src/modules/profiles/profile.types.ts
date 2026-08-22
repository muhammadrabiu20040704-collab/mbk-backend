import { Types } from "mongoose";
import { UserRole } from "../users/user.enums.js";

export interface ProfileStats {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  presentationsCount: number;
  debatesCount: number;
  coins: number;
}

export interface PublicProfile {
  id: string;
  fullName: string;
  username: string;

  country: string;

  profilePicture: string;
  coverPhoto: string;
  bio: string;

  school?: string;
  department?: string;
  level?: string;

  isVerified: boolean;

  stats: ProfileStats;

  createdAt: Date;
}

export interface MyProfile extends PublicProfile {
  phoneNumberVerified: boolean;
  interests: Types.ObjectId[];
  role: UserRole;
  isActive: boolean;
}

export interface UpdateProfileInput {
  username?: string;
  bio?: string;
  school?: string;
  department?: string;
  level?: string;
}

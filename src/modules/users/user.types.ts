import { Document, Types } from "mongoose";
import { AuthProvider, UserRole } from "./user.enums.js";
import { CountryCode } from "libphonenumber-js";

export interface IUser extends Document {
  fullName: string;

  username: string;

  country: CountryCode;

  phoneNumber: string;

  email?: string;

  password: string;

  provider: AuthProvider;

  role: UserRole;

  profilePicture: string;

  coverPhoto: string;

  bio: string;

  followersCount: number;

  followingCount: number;

  postsCount: number;

  presentationsCount: number;

  debatesCount: number;

  coins: number;

  isActive: boolean;

  isVerified: boolean;

  phoneNumberVerified: boolean;

  interests: Types.ObjectId[];

  comparePassword(candidatePassword: string): Promise<boolean>;

  createdAt: Date;

  updatedAt: Date;
}

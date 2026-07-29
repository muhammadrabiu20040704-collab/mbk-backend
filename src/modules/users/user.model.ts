import { Schema, model } from "mongoose";
import { IUser } from "./user.types.js";

const userSchema = new Schema<IUser>(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    profilePicture: {
      type: String,
      default: "",
    },
    coverPhoto: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
      maxLength: 250,
    },
    follwersCount: {
      type: String,
      default: 0,
    },
    followingCount: {
      type: String,
      default: 0,
    },
    postsCount: {
      type: String,
      default: 0,
    },
    presentationCount: {
      type: String,
      default: 0,
    },
    debateCount: {
      type: String,
      default: 0,
    },
    coins: {
      type: String,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const User = model<IUser>("User", userSchema);

import { Schema, model } from "mongoose";
import { IUser } from "./user.types.js";
import bcrypt from "bcrypt";
import { AuthProvider, UserRole } from "./user.enums.js";
import { env } from "../../config/env.js";

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      immutable: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
      enum: Object.values(AuthProvider),
      default: AuthProvider.LOCAL,
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
    followersCount: {
      type: Number,
      default: 0,
    },
    followingCount: {
      type: Number,
      default: 0,
    },
    postsCount: {
      type: Number,
      default: 0,
    },
    presentationsCount: {
      type: Number,
      default: 0,
    },
    debatesCount: {
      type: Number,
      default: 0,
    },
    coins: {
      type: Number,
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
    phoneNumberVerified: {
      type: Boolean,
      default: false,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    school: {
      type: String,
      trim: true,
      default: "",
    },

    department: {
      type: String,
      trim: true,
      default: "",
    },

    level: {
      type: String,
      trim: true,
      default: "",
    },
    interests: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
      index: true,
    },
  },
  { timestamps: true },
);
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await bcrypt.hash(this.password, env.BCRYPT_SALT_ROUNDS);
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = model<IUser>("User", userSchema);

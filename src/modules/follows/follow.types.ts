import type { Types } from "mongoose";

export interface FollowInput {
  followerId: Types.ObjectId;
  followingId: Types.ObjectId;
}

export interface FollowUser {
  id: string;
  fullName: string;
  username: string;
  profilePicture: string;
}

export interface FollowListResult {
  items: FollowUser[];

  pagination: {
    nextCursor: string | null;
    hasNextPage: boolean;
  };
}

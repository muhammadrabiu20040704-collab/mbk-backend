import { Types } from "mongoose";
import { Follow } from "./follow.model.js";
import { User } from "../users/user.model.js";
import { AppError } from "../../utils/app-error.js";

export class FollowService {
  async follow(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) {
      throw new AppError("You cannot follow yourself", 400);
    }

    const followingUser = await User.findOne({
      _id: followingId,
      isActive: true,
    }).select("_id");

    if (!followingUser) {
      throw new AppError("User not found", 404);
    }

    const existingFollow = await Follow.findOne({
      followerId,
      followingId,
    }).select("_id");

    if (existingFollow) {
      throw new AppError("You are already following this user", 409);
    }

    await Follow.create({
      followerId: new Types.ObjectId(followerId),
      followingId: new Types.ObjectId(followingId),
    });

    await User.updateOne({ _id: followerId }, { $inc: { followingCount: 1 } });

    await User.updateOne({ _id: followingId }, { $inc: { followersCount: 1 } });
  }

  async unfollow(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) {
      throw new AppError("You cannot unfollow yourself", 400);
    }

    const result = await Follow.deleteOne({
      followerId,
      followingId,
    });

    if (result.deletedCount === 0) {
      throw new AppError("You are not following this user", 404);
    }

    await User.updateOne({ _id: followerId }, { $inc: { followingCount: -1 } });

    await User.updateOne({ _id: followingId }, { $inc: { followersCount: -1 } });
  }

  async getFollowers(username: string, limit: number, cursor?: string) {
    const user = await User.findOne({
      username: username.toLowerCase(),
      isActive: true,
    }).select("_id");

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const query: Record<string, unknown> = {
      followingId: user._id,
    };

    if (cursor) {
      query._id = { $lt: cursor };
    }

    const follows = await Follow.find(query)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .populate({
        path: "followerId",
        select: "_id fullName username profilePicture bio isVerified",
        match: { isActive: true },
      })
      .lean();

    const hasNextPage = follows.length > limit;

    if (hasNextPage) {
      follows.pop();
    }

    const items = follows.filter((follow) => follow.followerId).map((follow) => follow.followerId);

    const nextCursor =
      hasNextPage && follows.length > 0 ? follows[follows.length - 1]._id.toString() : null;

    return {
      items,
      pagination: {
        nextCursor,
        hasNextPage,
      },
    };
  }

  async getFollowing(username: string, limit: number, cursor?: string) {
    const user = await User.findOne({
      username: username.toLowerCase(),
      isActive: true,
    }).select("_id");

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const query: Record<string, unknown> = {
      followerId: user._id,
    };

    if (cursor) {
      query._id = { $lt: cursor };
    }

    const follows = await Follow.find(query)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .populate({
        path: "followingId",
        select: "_id fullName username profilePicture bio isVerified",
        match: { isActive: true },
      })
      .lean();

    const hasNextPage = follows.length > limit;

    if (hasNextPage) {
      follows.pop();
    }

    const items = follows
      .filter((follow) => follow.followingId)
      .map((follow) => follow.followingId);

    const nextCursor =
      hasNextPage && follows.length > 0 ? follows[follows.length - 1]._id.toString() : null;

    return {
      items,
      pagination: {
        nextCursor,
        hasNextPage,
      },
    };
  }
}

export const followService = new FollowService();

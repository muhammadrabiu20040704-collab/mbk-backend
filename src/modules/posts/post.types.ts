import { Types } from "mongoose";

export enum PostType {
  TEXT = "text",
  IMAGE = "image",
  VIDEO = "video",
}

export enum PostAudience {
  PUBLIC = "public",
  FOLLOWERS = "followers",
  PRIVATE = "private",
}

export enum PostStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
}

export interface IPostMedia {
  url: string;
  publicId?: string;
  type: "image" | "video";
  width?: number;
  height?: number;
  duration?: number;
}

export interface IPostSettings {
  allowComments: boolean;
  allowShares: boolean;
  allowMentions: boolean;
}

export interface IPost {
  _id: Types.ObjectId;

  authorId: Types.ObjectId;

  type: PostType;

  description?: string;

  media: IPostMedia[];

  audience: PostAudience;

  location?: {
    name: string;
  };

  settings: IPostSettings;

  likesCount: number;
  commentsCount: number;
  sharesCount: number;

  status: PostStatus;

  createdAt: Date;
  updatedAt: Date;
}

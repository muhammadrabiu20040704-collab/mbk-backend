import { Schema, Types, model } from "mongoose";

export interface IFollow {
  followerId: Types.ObjectId;
  followingId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const followSchema = new Schema<IFollow>(
  {
    followerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    followingId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

export const Follow = model<IFollow>("Follow", followSchema);

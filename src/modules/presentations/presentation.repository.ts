import type { Types } from "mongoose";

import { Presentation } from "./presentation.mode.js";
import type { IPresentation } from "./presentation.types.js";

export class PresentationRepository {
  async create(data: Partial<IPresentation>) {
    return Presentation.create(data);
  }

  async findById(presentationId: Types.ObjectId) {
    return Presentation.findById(presentationId);
  }

  async findByPresenter(presenterId: Types.ObjectId) {
    return Presentation.find({ presenterId }).sort({
      createdAt: -1,
    });
  }

  async updateById(presentationId: Types.ObjectId, updates: Partial<IPresentation>) {
    return Presentation.findByIdAndUpdate(presentationId, updates, {
      new: true,
      runValidators: true,
    });
  }

  async deleteById(presentationId: Types.ObjectId) {
    return Presentation.findByIdAndDelete(presentationId);
  }
}

export const presentationRepository = new PresentationRepository();

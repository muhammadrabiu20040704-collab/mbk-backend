import type { Types } from "mongoose";

import { Presentation } from "./presentation.model.js";

import type {
  IPresentation,
  PresentationListFilters,
  UpdatePresentationInput,
} from "./presentation.types.js";

export class PresentationRepository {
  // Create a new presentation
  async create(data: Partial<IPresentation>) {
    return Presentation.create(data);
  }

  // Find a presentation by its ID
  async findById(presentationId: Types.ObjectId) {
    return Presentation.findById(presentationId);
  }

  // Find all presentations belonging to a presenter
  async findByPresenter(presenterId: Types.ObjectId) {
    return Presentation.find({ presenterId }).sort({
      createdAt: -1,
    });
  }

  // Update a presentation by its ID

  async updateById(presentationId: Types.ObjectId, updates: UpdatePresentationInput) {
    const { scheduledAt, ...otherUpdates } = updates;

    const updateQuery: {
      $set: Partial<IPresentation>;
      $unset?: { scheduledAt: 1 };
    } = {
      $set: otherUpdates,
    };

    if (scheduledAt === null) {
      updateQuery.$unset = { scheduledAt: 1 };
    } else if (scheduledAt !== undefined) {
      updateQuery.$set.scheduledAt =
        scheduledAt instanceof Date ? scheduledAt : new Date(scheduledAt);
    }
    return Presentation.findByIdAndUpdate(presentationId, updateQuery, {
      new: true,
      runValidators: true,
    });
  }

  // Delete a presentation by its ID
  async deleteById(presentationId: Types.ObjectId) {
    return Presentation.findByIdAndDelete(presentationId);
  }

  // Retrieve presentations with filtering, searching and pagination
  async findMany(filters: PresentationListFilters, page: number, limit: number) {
    const query: Record<string, unknown> = {};

    // Visibility filter
    if (filters.visibility) {
      query.visibility = filters.visibility;
    }

    // Status filter
    if (filters.status) {
      query.status = filters.status;
    }

    // Presentation type filter
    if (filters.presentationType) {
      query.presentationType = filters.presentationType;
    }

    // Category filter
    if (filters.category) {
      query.category = filters.category;
    }

    // Scheduled date filter
    if (filters.scheduledAfter) {
      query.scheduledAt = {
        $gte: filters.scheduledAfter,
      };
    }

    // Search by title, topic or description
    if (filters.search) {
      const escapedSearch = filters.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const searchRegex = new RegExp(escapedSearch, "i");

      query.$or = [{ title: searchRegex }, { topic: searchRegex }, { description: searchRegex }];
    }

    // Calculate pagination offset
    const skip = (page - 1) * limit;

    // Fetch presentations and total count concurrently
    const [presentations, total] = await Promise.all([
      Presentation.find(query)
        .sort(filters.scheduledAfter ? { scheduledAt: 1, createdAt: -1 } : { createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Presentation.countDocuments(query),
    ]);

    // Return paginated results
    return {
      presentations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

// Export repository instance
export const presentationRepository = new PresentationRepository();

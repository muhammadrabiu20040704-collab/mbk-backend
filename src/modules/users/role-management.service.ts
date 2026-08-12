import { User } from "./user.model.js";
import { UserRole } from "./user.enums.js";
import { AppError } from "../../utils/app-error.js";

export class RoleManagementService {
  async changeUserRole(targetUserId: string, newRole: UserRole, actorUserId: string) {
    if (targetUserId === actorUserId) {
      throw new AppError("You cannot change your own role", 403);
    }

    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      throw new AppError("User not found", 404);
    }

    if (targetUser.role === newRole) {
      throw new AppError("User already has this role", 400);
    }

    targetUser.role = newRole;

    await targetUser.save();

    return {
      id: targetUser._id.toString(),
      username: targetUser.username,
      role: targetUser.role,
    };
  }
}

export const roleManagementService = new RoleManagementService();

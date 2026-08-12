import { Request, Response, NextFunction } from "express";
import { User } from "../modules/users/user.model.js";
import { Permission } from "../modules/users/permission.enum.js";
import { ROLE_PERMISSIONS } from "../modules/users/role-permissions.js";
import { AppError } from "../utils/app-error.js";

export const authorize = (permission: Permission) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const user = await User.findById(req.user.sub).select("role isActive");

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!user.isActive) {
      throw new AppError("Account is inactive", 403);
    }

    const permissions = ROLE_PERMISSIONS[user.role];

    if (!permissions?.includes(permission)) {
      throw new AppError("Forbidden", 403);
    }

    next();
  };
};

import { Request, Response } from "express";
import { AppError } from "../../utils/app-error.js";
import { roleManagementService } from "./role-management.service.js";
import { validateUserRole } from "./user-role.validator.js";

export class UserController {
  async changeRole(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const userId = req.params.userId;

    if (typeof userId !== "string") {
      throw new AppError("Invalid user ID", 400);
    }
    const { role } = req.body;
    const validatedRole = validateUserRole(role);

    const result = await roleManagementService.changeUserRole(userId, validatedRole, req.user.sub);

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: result,
    });
  }
}

export const userController = new UserController();

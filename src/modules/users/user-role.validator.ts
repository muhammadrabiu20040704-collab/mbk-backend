import { UserRole } from "./user.enums.js";
import { AppError } from "../../utils/app-error.js";

export const validateUserRole = (role: unknown): UserRole => {
  if (role !== UserRole.USER && role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) {
    throw new AppError("Invalid user role", 400);
  }

  return role;
};

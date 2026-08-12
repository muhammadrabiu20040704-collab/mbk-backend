import { Permission } from "./permission.enum.js";
import { UserRole } from "./user.enums.js";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.USER]: [
    Permission.SESSIONS_READ,
    Permission.SESSIONS_REVOKE,
    Permission.SESSIONS_REVOKE_ALL,
  ],

  [UserRole.ADMIN]: [
    Permission.USERS_READ,
    Permission.USERS_UPDATE,
    Permission.USERS_SUSPEND,

    Permission.SESSIONS_READ,
    Permission.SESSIONS_REVOKE,
    Permission.SESSIONS_REVOKE_ALL,
  ],

  [UserRole.SUPER_ADMIN]: Object.values(Permission),
};

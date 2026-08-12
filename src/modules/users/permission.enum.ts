export enum Permission {
  USERS_READ = "users:read",
  USERS_UPDATE = "users:update",
  USERS_SUSPEND = "users:suspend",
  USERS_CHANGE_ROLE = "users:change_role",

  SESSIONS_READ = "sessions:read",
  SESSIONS_REVOKE = "sessions:revoke",
  SESSIONS_REVOKE_ALL = "sessions:revoke_all",
}

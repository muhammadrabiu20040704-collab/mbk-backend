import { Router } from "express";
import { authController } from "./auth.controller.js";
import { validateRequest } from "@middleware/validation.middleware.js";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyResetOTPSchema,
} from "./auth.validation.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { Permission } from "../users/permission.enum.js";

export const authRouter = Router();

authRouter.post("/register", validateRequest(registerSchema), authController.register);
authRouter.post("/login", validateRequest(loginSchema), authController.login);
authRouter.post("/refresh", validateRequest(refreshSchema), authController.refresh);
authRouter.get("/me", authMiddleware, authController.me);
authRouter.post("/logout", authController.logout);
authRouter.post("/logout-all", authController.logoutAll);
authRouter.get(
  "/sessions",
  authMiddleware,
  authorize(Permission.SESSIONS_READ),
  authController.getSessions,
);
authRouter.delete("/sessions/:sessionId", authMiddleware, authController.revokeSession);
authRouter.patch(
  "/change-password",
  authMiddleware,
  validateRequest(changePasswordSchema),
  authController.changePassword,
);
authRouter.post(
  "/forgot-password",
  validateRequest(forgotPasswordSchema),
  authController.forgotPassword,
);

authRouter.post(
  "/reset-password",
  validateRequest(resetPasswordSchema),
  authController.resetPassword,
);

authRouter.post(
  "/verify-reset-otp",
  validateRequest(verifyResetOTPSchema),
  authController.verifyResetOTP,
);

export default authRouter;

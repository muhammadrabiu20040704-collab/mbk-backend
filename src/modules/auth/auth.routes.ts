import { Router } from "express";
import { authController } from "./auth.controller.js";
import { validateRequest } from "@middleware/validation.middleware.js";
import { registerSchema, loginSchema, refreshSchema } from "./auth.validation.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

export const authRouter = Router();

authRouter.post("/register", validateRequest(registerSchema), authController.register);
authRouter.post("/login", validateRequest(loginSchema), authController.login);
authRouter.post("/refresh", validateRequest(refreshSchema), authController.refresh);
authRouter.get("/me", authMiddleware, authController.me);
authRouter.post("/logout", authController.logout);
authRouter.post("/logout-all", authController.logoutAll);
authRouter.get("/sessions", authMiddleware, authController.getSessions);
authRouter.delete("/sessions/:sessionId", authMiddleware, authController.revokeSession);

export default authRouter;

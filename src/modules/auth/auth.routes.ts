import { Router } from "express";
import { authController } from "./auth.controller.js";
import { validateRequest } from "@middleware/validation.middleware.js";
import { registerSchema, loginSchema } from "./auth.validation.js";

export const authRouter = Router();

authRouter.post("/register", validateRequest(registerSchema), authController.register);
authRouter.post("/login", validateRequest(loginSchema), authController.login);

export default authRouter;

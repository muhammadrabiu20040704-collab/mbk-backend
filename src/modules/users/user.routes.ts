import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { Permission } from "./permission.enum.js";
import { userController } from "./user.controller.js";
import profileRouter from "../profiles/profile.routes.js";

const router = Router();

router.patch(
  "/:userId/role",
  authMiddleware,
  authorize(Permission.USERS_CHANGE_ROLE),
  userController.changeRole.bind(userController),
);

router.use("/", profileRouter);

export default router;

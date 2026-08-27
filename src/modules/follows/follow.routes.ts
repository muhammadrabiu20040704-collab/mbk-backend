import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { followController } from "./follow.controller.js";

const router = Router();

router.post("/:userId/follow", authMiddleware, followController.follow.bind(followController));

router.delete("/:userId/follow", authMiddleware, followController.unfollow.bind(followController));

router.get("/:username/followers", followController.getFollowrs.bind(followController));

router.get("/:username/following", followController.getFollowing.bind(followController));

export default router;

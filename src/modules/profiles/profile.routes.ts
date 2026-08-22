import { Router } from "express";
import { profileController } from "./profile.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

// Get my profile
router.get("/me", authMiddleware, (req, res) => {
  return profileController.getMyProfile(req, res);
});

// Get public profile
router.get("/:username", (req, res) => {
  return profileController.getPublicProfile(req, res);
});

// update my profile
router.patch("/me", authMiddleware, (req, res) => {
  return profileController.updateProfile(req, res);
});

export default router;

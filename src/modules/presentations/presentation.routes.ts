import { Router } from "express";

import { authMiddleware } from "@middleware/auth.middleware.js";
import { presentationController } from "./presentation.controller.js";
import { presentationCoverUpload } from "../../shared/media/media.upload.js";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  presentationCoverUpload.single("coverImage"),
  presentationController.create.bind(presentationController),
);

router.get("/", presentationController.list.bind(presentationController));

router.get("/my", presentationController.getMyPresentations.bind(presentationController));

router.get("/:presentationId", presentationController.getById.bind(presentationController));

router.patch(
  "/:presentationId",
  presentationCoverUpload.single("coverImage"),
  presentationController.update.bind(presentationController),
);
export default router;

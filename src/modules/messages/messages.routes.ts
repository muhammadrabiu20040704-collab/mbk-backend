import { Router } from "express";

import { authMiddleware } from "@middleware/auth.middleware.js";
import { messagesController } from "./messages.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/conversations", messagesController.createConversation.bind(messagesController));
router.get("/conversations", messagesController.getConversations.bind(messagesController));
router.get(
  "/conversations/:conversationId",
  messagesController.getConversation.bind(messagesController),
);
router.post(
  "/conversations/:conversationId/messages",
  messagesController.sendMessage.bind(messagesController),
);
router.get(
  "/conversations/:conversationId/messages",
  messagesController.getMessages.bind(messagesController),
);

router.patch(
  "/:messageId/delivered",
  messagesController.markMessageAsDelivered.bind(messagesController),
);

router.patch("/:messageId/read", messagesController.markMessageAsRead.bind(messagesController));

router.delete("/:messageId", messagesController.deleteMessage.bind(messagesController));

export default router;

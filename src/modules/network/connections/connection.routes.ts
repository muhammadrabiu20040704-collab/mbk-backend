import { Router } from "express";

import { authMiddleware } from "@middleware/auth.middleware.js";
import { connectionController } from "./connection.controller.js";

const router = Router();

router.use(authMiddleware);

// Send a connection request to another student.
router.post("/:userId/request", connectionController.sendRequest.bind(connectionController));

// Retrieve incoming and outgoing connection requests.
router.get(
  "/requests/incoming",
  connectionController.getIncomingRequests.bind(connectionController),
);

router.get(
  "/requests/outgoing",
  connectionController.getOutgoingRequests.bind(connectionController),
);

// Retrieve accepted connections.
router.get("/", connectionController.getConnections.bind(connectionController));

// Accept or decline an incoming request.
router.post("/:connectionId/accept", connectionController.acceptRequest.bind(connectionController));

router.post(
  "/:connectionId/decline",
  connectionController.declineRequest.bind(connectionController),
);

// Cancel an outgoing request.
router.delete(
  "/:connectionId/request",
  connectionController.cancelRequest.bind(connectionController),
);

// Remove an accepted connection.
router.delete("/:connectionId", connectionController.removeConnection.bind(connectionController));

export default router;

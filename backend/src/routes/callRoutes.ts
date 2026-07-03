// backend/src/routes/callRoutes.ts

import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { startCall, endCall, acceptCall, rejectCall } from "../controllers/callController.js";

const router = Router();

router.post("/", protect, startCall);
router.patch("/:callId/end", protect, endCall);
router.patch("/:callId/accept", protect, acceptCall);
router.patch("/:callId/reject", protect, rejectCall);

export default router;

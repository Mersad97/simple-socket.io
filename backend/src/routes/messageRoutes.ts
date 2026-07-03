// backend/src/routes/messageRoutes.ts

import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { sendMessage, markAsRead } from "../controllers/messageController.js";

const router = Router();

router.post("/", protect, sendMessage);
router.patch("/:messageId/read", protect, markAsRead);

export default router;

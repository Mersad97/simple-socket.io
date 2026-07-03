// backend/src/routes/chatRoutes.ts

import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getChats, getMessages, createPrivateChat } from "../controllers/chatController.js";

const router = Router();

router.get("/", protect, getChats);
router.get("/:chatId/messages", protect, getMessages);
router.post("/", protect, createPrivateChat);

export default router;

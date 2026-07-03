// backend/src/routes/fileRoutes.ts

import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getFile } from "../controllers/fileController.js";

const router = Router();

router.get("/:filename", protect, getFile);

export default router;

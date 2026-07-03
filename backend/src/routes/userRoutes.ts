// backend/src/routes/userRoutes.ts

import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { searchUsers } from "../controllers/userController.js";

const router = Router();

router.get("/search", protect, searchUsers);

export default router;

// backend/src/routes/authRoutes.ts

import { Router } from "express";
import * as controller from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, registerSchema } from "../validation/auth.js";
import { protect } from "../middleware/authMiddleware.js";
const router = Router();

// user self routes
router.get("/me", protect, controller.getUserMe);
router.post("/login", validate({ body: loginSchema }), controller.login);
router.post("/register", validate({ body: registerSchema }), controller.register);

// ✅ مسیر خروج
router.post("/logout", protect, controller.logout);

export default router;

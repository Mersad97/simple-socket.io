// backend/src/routes/uploadRoutes.ts

import { Router } from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { uploadSchema } from "../validation/upload.js";
import { uploadMedia } from "../controllers/uploadController.js";

// استفاده از memoryStorage برای دسترسی به بافر
const storage = multer.memoryStorage();

// فیلتر نوع فایل (اختیاری - می‌توان در سرویس هم بررسی کرد)
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // اجازه همه فایل‌ها را می‌دهیم، ولی در سرویس بررسی دقیق می‌شود
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

const router = Router();

router.post("/", protect, upload.single("file"), validate({ body: uploadSchema }), uploadMedia);

export default router;

// // backend/src/routes/uploadRoutes.ts

// import { Router } from "express";
// import { protect } from "../middleware/authMiddleware.js";
// import { uploadFile, handleUpload } from "../controllers/uploadController.js";

// const router = Router();

// router.post("/", protect, uploadFile, handleUpload);

// export default router;

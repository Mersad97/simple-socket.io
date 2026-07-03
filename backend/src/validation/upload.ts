import { z } from "zod";

export const uploadSchema = z.object({
  chatId: z.string().uuid({ message: "chatId معتبر نیست" }),
  messageType: z.enum(["TEXT", "IMAGE", "VIDEO", "AUDIO", "FILE"]).optional(),
  content: z.string().optional(),
  // در صورت نیاز فیلدهای دیگر
});

export type UploadInput = z.infer<typeof uploadSchema>;

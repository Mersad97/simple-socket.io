// src/validations/auth/authByEmailValidation.ts
import { z } from "zod";

export const registerSchema = z.object({
  phone: z.string().min(11).max(11),
  name: z.string().min(3).max(20),
  username: z.string().min(5).max(20),
  password: z.string().min(6).max(25),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  username: z.string().min(5).max(20).nonempty("username  الزامی است."),
  password: z.string().min(6).max(25).nonempty("password الزامی است."),
});
export type LoginInput = z.infer<typeof loginSchema>;

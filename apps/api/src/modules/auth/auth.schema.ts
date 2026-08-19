import { z } from "zod";

const password = z.string().min(12).max(128);
const email = z
  .string()
  .trim()
  .email()
  .max(320)
  .transform((value) => value.toLowerCase());

export const registerSchema = z.object({
  businessName: z.string().trim().min(2).max(200),
  businessType: z.string().trim().max(100).optional(),
  industry: z.string().trim().max(100).optional(),
  businessEmail: email.optional(),
  currency: z.string().trim().length(3).toUpperCase().default("USD"),
  timeZone: z.string().trim().min(1).max(100).default("UTC"),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email,
  phone: z.string().trim().max(40).optional(),
  password,
});

export const loginSchema = z.object({ email, password: z.string().min(1).max(128) });
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: password,
});
export const forgotPasswordSchema = z.object({ email });
export const resetPasswordSchema = z.object({ token: z.string().min(32).max(256), password });
export const verifyEmailSchema = z.object({ token: z.string().min(32).max(256) });

export type RegisterInput = z.input<typeof registerSchema>;
export type LoginInput = z.input<typeof loginSchema>;

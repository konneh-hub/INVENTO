// TODO: Define validated environment configuration in a later phase.
import { z } from "zod";

const environmentSchema = z.object({
  DATABASE_URL: z.string().min(1).optional(),
  AUTH_SESSION_DAYS: z.coerce.number().int().positive().default(30),
  AUTH_RESET_TOKEN_MINUTES: z.coerce.number().int().positive().default(60),
  AUTH_VERIFICATION_TOKEN_HOURS: z.coerce.number().int().positive().default(24),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export const env = environmentSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SESSION_DAYS: process.env.AUTH_SESSION_DAYS,
  AUTH_RESET_TOKEN_MINUTES: process.env.AUTH_RESET_TOKEN_MINUTES,
  AUTH_VERIFICATION_TOKEN_HOURS: process.env.AUTH_VERIFICATION_TOKEN_HOURS,
  NODE_ENV: process.env.NODE_ENV,
});

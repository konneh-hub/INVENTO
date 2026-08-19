import { createApiClient } from "@inventory/api-client";

export const adminApi = createApiClient({
  baseUrl: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/api/v1`,
  credentials: "include",
});

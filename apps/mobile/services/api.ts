import { createApiClient } from "@inventory/api-client";

export const mobileApi = createApiClient({
  baseUrl: `${process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001"}/api/v1`,
  credentials: "include",
});

import { createApiClient } from "@inventory/api-client";

export const webApi = createApiClient({
  baseUrl: `${import.meta.env.VITE_API_URL ?? "http://localhost:3001"}/api/v1`,
  credentials: "include",
});

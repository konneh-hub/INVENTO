export type ApiClientConfig = {
  baseUrl: string;
  credentials?: RequestCredentials;
};

export const defaultApiClientConfig: ApiClientConfig = {
  baseUrl: "/api/v1",
  credentials: "include",
};

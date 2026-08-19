import type { ApiClientConfig } from "./config";

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export function createApiClient(config: ApiClientConfig) {
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${config.baseUrl}${path}`, {
      ...init,
      credentials: config.credentials ?? "include",
      headers: { "content-type": "application/json", ...init.headers },
    });
    const payload = (await response.json().catch(() => null)) as T & {
      error?: { code?: string; message?: string };
    };
    if (!response.ok)
      throw new ApiClientError(
        response.status,
        payload.error?.code ?? "REQUEST_FAILED",
        payload.error?.message ?? "Request failed.",
      );
    return payload;
  }

  return {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body: unknown) =>
      request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  };
}

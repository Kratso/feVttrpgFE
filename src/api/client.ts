const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000/api";

type UnauthorizedHandler = () => void;

type ApiFetchOptions = RequestInit & {
  skipUnauthorizedHandling?: boolean;
};

let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  unauthorizedHandler = handler;
}

export class ApiError extends Error {
  status: number;
  body: Record<string, unknown>;

  constructor(message: string, status: number, body: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}) {
  const { skipUnauthorizedHandling, ...fetchOptions } = options;
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(fetchOptions.headers ?? {}),
    },
    ...fetchOptions,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    if (res.status === 401 && !skipUnauthorizedHandling) {
      unauthorizedHandler?.();
    }
    throw new ApiError(String(body.error ?? "Request failed"), res.status, body);
  }

  return res.json() as Promise<T>;
}

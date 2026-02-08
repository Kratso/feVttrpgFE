export const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000/api";

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
  const hasBody = fetchOptions.body !== undefined;
  const isFormData = typeof FormData !== "undefined" && fetchOptions.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(fetchOptions.headers ?? {}),
  };
  if (hasBody && !isFormData) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      ...headers,
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

export async function apiUpload<T>(path: string, formData: FormData) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    if (res.status === 401) {
      unauthorizedHandler?.();
    }
    throw new ApiError(String(body.error ?? "Request failed"), res.status, body);
  }

  return res.json() as Promise<T>;
}

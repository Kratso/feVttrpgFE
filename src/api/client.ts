const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000/api";

export async function apiFetch<T>(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Request failed");
  }

  return res.json() as Promise<T>;
}

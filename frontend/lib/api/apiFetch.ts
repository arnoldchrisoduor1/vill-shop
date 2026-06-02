import { API_URL } from '../constants';
import { getCookie } from '../cookies';
import type { ApiResponse } from '../../types/api';

class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {};

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  // Append currency query param to GET requests
  let url = `${API_URL}${path}`;
  if (!options.method || options.method === 'GET') {
    const currency = typeof window !== 'undefined' ? getCookie('currency') : null;
    if (currency && currency !== 'KES') {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}currency=${currency}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
    credentials: 'include',
    // Next.js caches server-component fetch by default; storefront must read fresh API data
    cache: options.cache ?? 'no-store',
  });

  if (response.status === 401) {
    const isSessionCheck = url.includes('/auth/me');
    const isAuthRequest = url.includes('/auth/login') || url.includes('/auth/register');
    if (
      typeof window !== 'undefined' &&
      !isSessionCheck &&
      !isAuthRequest &&
      !window.location.pathname.startsWith('/login') &&
      !window.location.pathname.startsWith('/register')
    ) {
      window.location.href = '/login';
    }
    throw new ApiError(401, 'Unauthorized');
  }

  if (response.status === 204) {
    return { success: true, message: 'OK', data: null as T, code: 204 };
  }

  const text = await response.text();
  if (!text) {
    throw new ApiError(response.status, 'Empty response from server');
  }

  const data = JSON.parse(text) as ApiResponse<T>;

  if (!data.success) {
    throw new ApiError(
      data.code || response.status,
      data.message || 'Request failed',
      data.errors as Record<string, string[]> | undefined,
    );
  }

  return data;
}

export { ApiError };

export async function apiGet<T>(path: string): Promise<T> {
  const res = await apiFetch<T>(path);
  return res.data;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await apiFetch<T>(path, {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
  return res.data;
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const res = await apiFetch<T>(path, {
    method: 'PATCH',
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
  return res.data;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await apiFetch<T>(path, { method: 'DELETE' });
  return res.data;
}

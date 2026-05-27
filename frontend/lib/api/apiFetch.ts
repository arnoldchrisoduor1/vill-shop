import { env } from '@/config/env';
import { CURRENCY_COOKIE, DEFAULT_CURRENCY } from '@/lib/constants';
import { getSessionId } from '@/lib/session';
import type { ApiError, ApiResponse } from '@/types';

export class ApiFetchError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiFetchError';
  }
}

function getCurrency(): string {
  if (typeof document === 'undefined') return DEFAULT_CURRENCY;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CURRENCY_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : DEFAULT_CURRENCY;
}

interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(path: string, params?: ApiFetchOptions['params']): string {
  const url = new URL(`${env.apiUrl}${path.startsWith('/') ? path : `/${path}`}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { body, params, headers: customHeaders, ...rest } = options;
  const isFormData = body instanceof FormData;

  const sessionId = typeof window !== 'undefined' ? getSessionId() : '';

  const headers: HeadersInit = {
    Accept: 'application/json',
    'X-Currency': getCurrency(),
    ...(sessionId ? { 'X-Session-ID': sessionId } : {}),
    ...(customHeaders as Record<string, string>),
  };

  if (body && !isFormData) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  const response = await fetch(buildUrl(path, params), {
    ...rest,
    credentials: 'include',
    headers,
    body: body
      ? isFormData
        ? (body as FormData)
        : JSON.stringify(body)
      : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const json = (await response.json()) as ApiResponse<T> | ApiError;

  if (!response.ok || !json.success) {
    const error = json as ApiError;
    throw new ApiFetchError(
      error.message ?? 'Request failed',
      response.status,
      error.errors,
    );
  }

  return (json as ApiResponse<T>).data;
}

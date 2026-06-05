/**
 * Fallback client-side rewrite when API still returns internal MinIO URLs.
 * Prefer S3_PUBLIC_URL on the backend so responses are already public.
 */
export function resolveMediaUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;

  const publicBase =
    process.env.NEXT_PUBLIC_MEDIA_URL?.replace(/\/+$/, '') ||
    (process.env.NEXT_PUBLIC_API_URL || '')
      .replace(/\/api\/?$/, '')
      .replace(/\/+$/, '') + '/storage';

  if (!publicBase || publicBase === '/storage') return url;

  const internalPrefixes = [
    'http://minio:9000',
    'http://localhost:9000',
    'http://127.0.0.1:19000',
  ];

  for (const prefix of internalPrefixes) {
    if (url.startsWith(prefix)) {
      return `${publicBase}${url.slice(prefix.length)}`;
    }
  }

  return url;
}

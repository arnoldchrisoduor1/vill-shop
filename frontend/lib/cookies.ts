import { ROLE_COOKIE } from '@/lib/constants';

export function setRoleCookie(role: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${ROLE_COOKIE}=${encodeURIComponent(role)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function clearRoleCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${ROLE_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

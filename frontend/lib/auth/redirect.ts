import type { User } from '../../types';

/**
 * Safe post-login destination. Admins default to /admin/dashboard; customers to
 * /account. Only same-origin relative paths are allowed (no open redirects).
 */
export function getPostLoginRedirect(
  user: Pick<User, 'role'>,
  redirectParam: string | null | undefined,
): string {
  const adminHome = '/admin/dashboard';
  const customerHome = '/account';
  const fallback = user.role === 'admin' ? adminHome : customerHome;

  if (!redirectParam || redirectParam === '/') {
    return fallback;
  }

  if (!redirectParam.startsWith('/') || redirectParam.startsWith('//')) {
    return fallback;
  }

  if (redirectParam.startsWith('/admin')) {
    return user.role === 'admin' ? redirectParam : fallback;
  }

  return redirectParam;
}

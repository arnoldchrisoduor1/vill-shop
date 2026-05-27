import { clearRoleCookie, setRoleCookie } from '@/lib/cookies';
import { apiFetch } from './apiFetch';
import type { AuthResponse, User } from '@/types';
import type { LoginFormData, RegisterFormData, ProfileFormData } from '@/validators';

export async function login(data: LoginFormData): Promise<AuthResponse> {
  const response = await apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: data });
  setRoleCookie(response.user.role);
  return response;
}

export async function register(data: RegisterFormData): Promise<AuthResponse> {
  const response = await apiFetch<AuthResponse>('/auth/register', { method: 'POST', body: data });
  setRoleCookie(response.user.role);
  return response;
}

export async function logout(): Promise<void> {
  try {
    await apiFetch<void>('/auth/logout', { method: 'POST' });
  } finally {
    clearRoleCookie();
  }
}

export async function getMe(): Promise<User> {
  return apiFetch<User>('/auth/me');
}

export async function updateProfile(data: ProfileFormData): Promise<User> {
  return apiFetch<User>('/profile', { method: 'PUT', body: data });
}

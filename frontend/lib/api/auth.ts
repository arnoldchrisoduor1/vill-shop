import { apiFetch, apiGet } from './apiFetch';
import type { User } from '../../types';

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    apiFetch<{ user: User }>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    apiFetch<{ user: User }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiFetch<null>('/api/v1/auth/logout', { method: 'POST' }),

  me: () => apiGet<User>('/api/v1/auth/me'),
};

export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload {
  name: string; email: string; password: string; phone?: string;
}

export const login = (payload: LoginPayload) =>
  apiFetch<{ user: User; accessToken: string }>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const register = (payload: RegisterPayload) =>
  apiFetch<{ user: User; accessToken: string }>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const logout = () =>
  apiFetch<null>('/api/v1/auth/logout', { method: 'POST' });

export const getMe = () =>
  apiFetch<User>('/api/v1/auth/me');

export const updateProfile = (payload: { name?: string; phone?: string }) =>
  apiFetch<User>('/api/v1/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

export const changePassword = (payload: { currentPassword: string; newPassword: string }) =>
  apiFetch<null>('/api/v1/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

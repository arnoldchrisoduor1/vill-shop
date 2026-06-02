import { apiGet, apiPatch, apiPost } from './apiFetch';
import type { User } from '../../types';
import type { PaginatedResponse } from '../../types/api';

export const usersApi = {
  getProfile: () => apiGet<User>('/api/v1/profile'),
  updateProfile: (data: { name?: string; phone?: string; email?: string }) =>
    apiPatch<User>('/api/v1/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiPost<null>('/api/v1/profile/change-password', data),

  // Admin
  adminGetAll: (page = 1) =>
    apiGet<PaginatedResponse<User>>(`/api/v1/admin/customers?page=${page}`),
  adminGetById: (id: string) => apiGet<User>(`/api/v1/admin/customers/${id}`),
  adminBan: (id: string) => apiPatch<User>(`/api/v1/admin/customers/${id}/ban`),
  adminUnban: (id: string) => apiPatch<User>(`/api/v1/admin/customers/${id}/unban`),
};

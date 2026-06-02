import { apiFetch } from './apiFetch';
import type { User } from '@/types/user';
import type { PaginatedResponse } from '@/types/api';

export async function adminGetCustomers(params?: {
  search?: string;
  cursor?: string;
  limit?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.cursor) qs.set('cursor', params.cursor);
  if (params?.limit) qs.set('limit', String(params.limit));
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return apiFetch<PaginatedResponse<User>>(
    `/api/v1/admin/customers${query}`
  );
}

export async function adminBanCustomer(id: string) {
  return apiFetch<User>(`/api/v1/admin/customers/${id}/ban`, {
    method: 'POST',
  });
}

export async function adminUnbanCustomer(id: string) {
  return apiFetch<User>(`/api/v1/admin/customers/${id}/unban`, {
    method: 'POST',
  });
}

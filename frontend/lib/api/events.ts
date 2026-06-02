import { apiGet, apiPatch, apiDelete, apiFetch } from './apiFetch';
import type { ShopEvent } from '../../types';
import type { PaginatedResponse } from '../../types/api';

export const eventsApi = {
  getAll: () => apiGet<ShopEvent[]>('/api/v1/events'),
  getAdminAll: () => apiGet<ShopEvent[]>('/api/v1/events/admin/all'),
  getById: (id: string) => apiGet<ShopEvent>(`/api/v1/events/admin/${id}`),
  getFeatured: () => apiGet<ShopEvent[]>('/api/v1/events/featured'),
  getBySlug: (slug: string) => apiGet<ShopEvent>(`/api/v1/events/${slug}`),
  create: (data: FormData | object) =>
    apiFetch<ShopEvent>('/api/v1/events', {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  update: (id: string, data: FormData | object) =>
    apiFetch<ShopEvent>(`/api/v1/events/${id}`, {
      method: 'PATCH',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  delete: (id: string) => apiDelete<null>(`/api/v1/events/${id}`),
  togglePublished: (id: string) => apiPatch<ShopEvent>(`/api/v1/events/${id}/published`),
  toggleFeatured: (id: string) => apiPatch<ShopEvent>(`/api/v1/events/${id}/featured`),
};

export const getEvents = (params?: { limit?: number; isFeatured?: boolean }) => {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.isFeatured !== undefined) qs.set('isFeatured', String(params.isFeatured));
  const q = qs.toString() ? `?${qs.toString()}` : '';
  return apiFetch<PaginatedResponse<ShopEvent>>(`/api/v1/events${q}`);
};

export const getEvent = (slug: string) =>
  apiFetch<ShopEvent>(`/api/v1/events/${slug}`);

export const adminCreateEvent = (data: Partial<ShopEvent>) =>
  apiFetch<ShopEvent>('/api/v1/admin/events', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const adminUpdateEvent = (id: string, data: Partial<ShopEvent>) =>
  apiFetch<ShopEvent>(`/api/v1/admin/events/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const adminDeleteEvent = (id: string) =>
  apiFetch<null>(`/api/v1/admin/events/${id}`, { method: 'DELETE' });

export const adminTogglePublished = (id: string, isPublished: boolean) =>
  apiFetch<ShopEvent>(`/api/v1/admin/events/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ isPublished }),
  });

export const adminToggleEventFeatured = (id: string, isFeatured: boolean) =>
  apiFetch<ShopEvent>(`/api/v1/admin/events/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ isFeatured }),
  });

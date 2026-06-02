import { apiGet, apiPost, apiPatch, apiFetch } from './apiFetch';
import type { Order } from '../../types';
import type { PaginatedResponse } from '../../types/api';

export interface CreateOrderDto {
  currency?: string;
  shippingAddress?: {
    name: string;
    address: string;
    city: string;
    phone: string;
  };
}

export const ordersApi = {
  getOrders: (page = 1) =>
    apiGet<PaginatedResponse<Order>>(`/api/v1/orders?page=${page}`),
  getOrder: (id: string) => apiGet<Order>(`/api/v1/orders/${id}`),
  createOrder: (data: CreateOrderDto) => apiPost<Order>('/api/v1/orders', data),
  getDownloadUrl: (orderId: string, itemId: string) =>
    apiPost<{ url: string }>(`/api/v1/orders/${orderId}/items/${itemId}/download`),
  
  // Admin
  adminGetOrders: (page = 1, state?: string) =>
    apiGet<PaginatedResponse<Order>>(
      `/api/v1/orders/admin/all?page=${page}${state ? `&state=${state}` : ''}`,
    ),
  adminGetOrder: (id: string) => apiGet<Order>(`/api/v1/orders/admin/${id}`),
  adminTransitionState: (id: string, state: string) =>
    apiPatch<Order>(`/api/v1/orders/admin/${id}/state`, { state }),
  adminUpdateTracking: (id: string, trackingNumber: string) =>
    apiPatch<Order>(`/api/v1/orders/admin/${id}/tracking`, { trackingNumber }),
};

export const getOrders = (params?: { cursor?: string; limit?: number }) => {
  const qs = new URLSearchParams();
  if (params?.cursor) qs.set('cursor', params.cursor);
  if (params?.limit) qs.set('limit', String(params.limit));
  const q = qs.toString() ? `?${qs.toString()}` : '';
  return apiFetch<PaginatedResponse<Order>>(`/api/v1/orders${q}`);
};

export const getOrder = (id: string) =>
  apiFetch<Order>(`/api/v1/orders/${id}`);

export const createOrder = (payload: CreateOrderDto) =>
  apiFetch<Order>('/api/v1/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const getDownloadUrl = (orderId: string, itemId: string) =>
  apiFetch<{ url: string }>(
    `/api/v1/orders/${orderId}/items/${itemId}/download`
  );

export const adminGetOrders = (params?: { state?: string; cursor?: string; limit?: number }) => {
  const qs = new URLSearchParams();
  if (params?.state) qs.set('state', params.state);
  if (params?.cursor) qs.set('cursor', params.cursor);
  if (params?.limit) qs.set('limit', String(params.limit));
  const q = qs.toString() ? `?${qs.toString()}` : '';
  return apiFetch<PaginatedResponse<Order>>(`/api/v1/orders/admin/all${q}`);
};

export const adminUpdateOrderState = (id: string, state: string) =>
  apiFetch<Order>(`/api/v1/orders/admin/${id}/state`, {
    method: 'PATCH',
    body: JSON.stringify({ state }),
  });

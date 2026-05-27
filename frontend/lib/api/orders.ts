import { env } from '@/config/env';
import { apiFetch } from './apiFetch';
import { mapCheckoutPayload, normalizeOrder } from './normalize';
import type { PaginatedResponse } from '@/types';
import type { Order } from '@/types/order';
import type { CheckoutFormData } from '@/validators';

export interface CreateOrderResponse {
  order: Order;
  payment: {
    redirect_url?: string;
    payment_url?: string;
  };
}

function normalizePaginatedOrders(
  response: PaginatedResponse<Record<string, unknown>>,
): PaginatedResponse<Order> {
  return {
    ...response,
    data: response.data.map((item) => normalizeOrder(item)),
  };
}

export async function getOrders(): Promise<Order[]> {
  const response = await apiFetch<PaginatedResponse<Record<string, unknown>>>('/orders');
  return normalizePaginatedOrders(response).data;
}

export async function getOrder(orderNumber: string): Promise<Order> {
  const order = await apiFetch<Record<string, unknown>>(`/orders/${orderNumber}`);
  return normalizeOrder(order);
}

export async function createOrder(data: CheckoutFormData): Promise<CreateOrderResponse> {
  const response = await apiFetch<{
    order: Record<string, unknown>;
    payment: CreateOrderResponse['payment'];
  }>('/orders', {
    method: 'POST',
    body: mapCheckoutPayload(data),
  });

  return {
    order: normalizeOrder(response.order),
    payment: response.payment ?? {},
  };
}

export async function getAdminOrders(params?: {
  status?: string;
  page?: number;
  search?: string;
}): Promise<PaginatedResponse<Order>> {
  const response = await apiFetch<PaginatedResponse<Record<string, unknown>>>('/admin/orders', { params });
  return normalizePaginatedOrders(response);
}

export async function shipOrder(id: number): Promise<Order> {
  const order = await apiFetch<Record<string, unknown>>(`/admin/orders/${id}/ship`, { method: 'POST' });
  return normalizeOrder(order);
}

export async function deliverOrder(id: number): Promise<Order> {
  const order = await apiFetch<Record<string, unknown>>(`/admin/orders/${id}/deliver`, { method: 'POST' });
  return normalizeOrder(order);
}

export async function cancelOrder(id: number): Promise<Order> {
  const order = await apiFetch<Record<string, unknown>>(`/admin/orders/${id}/cancel`, { method: 'POST' });
  return normalizeOrder(order);
}

export async function refundOrder(id: number): Promise<Order> {
  const order = await apiFetch<Record<string, unknown>>(`/admin/orders/${id}/refund`, { method: 'POST' });
  return normalizeOrder(order);
}

export async function downloadOrderItem(orderNumber: string, itemId: number): Promise<string> {
  const response = await apiFetch<{ download_url: string }>(
    `/orders/${orderNumber}/items/${itemId}/download`,
    { method: 'POST' },
  );
  return response.download_url;
}

export async function downloadOrdersReport(from?: string, to?: string): Promise<void> {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);

  const url = `${env.apiUrl}/admin/reports/orders.csv?${params.toString()}`;
  const response = await fetch(url, { credentials: 'include' });

  if (!response.ok) {
    throw new Error('Failed to download report');
  }

  const blob = await response.blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'orders-report.csv';
  link.click();
  URL.revokeObjectURL(link.href);
}

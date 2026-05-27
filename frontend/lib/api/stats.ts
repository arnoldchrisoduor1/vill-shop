import { apiFetch } from './apiFetch';
import { normalizeProduct } from './normalize';
import type { DashboardStats, PublicStats } from '@/types/stats';
import type { User } from '@/types/user';
import type { PaginatedResponse } from '@/types';
import type { Product } from '@/types/product';
import type { HeroSlide } from '@/types/hero';
import type { HeroSlideFormData } from '@/validators';

interface BackendDashboardStats {
  orders: {
    total_orders: number;
    pending_orders: number;
    processing_orders: number;
    total_revenue_kes: number;
  };
  customers: number;
  low_stock_products: number;
}

export async function getPublicStats(): Promise<PublicStats> {
  return apiFetch<PublicStats>('/stats');
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const data = await apiFetch<BackendDashboardStats>('/admin/dashboard/stats');

  return {
    total_revenue: data.orders.total_revenue_kes / 100,
    total_orders: data.orders.total_orders,
    total_customers: data.customers,
    total_products: 0,
    revenue_change: 0,
    orders_change: 0,
    customers_change: 0,
    low_stock_count: data.low_stock_products,
  };
}

export async function getCustomers(params?: {
  page?: number;
  search?: string;
}): Promise<PaginatedResponse<User>> {
  return apiFetch<PaginatedResponse<User>>('/admin/customers', { params });
}

export async function getLowStockProducts(): Promise<Product[]> {
  const products = await apiFetch<Record<string, unknown>[]>('/admin/inventory/low-stock');
  return products.map((product) => normalizeProduct(product));
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  return apiFetch<HeroSlide[]>('/hero-slides');
}

export async function getAdminHeroSlides(): Promise<HeroSlide[]> {
  return apiFetch<HeroSlide[]>('/admin/hero-slides');
}

export async function createHeroSlide(data: HeroSlideFormData): Promise<HeroSlide> {
  return apiFetch<HeroSlide>('/admin/hero-slides', { method: 'POST', body: data });
}

export async function updateHeroSlide(
  id: number,
  data: HeroSlideFormData,
): Promise<HeroSlide> {
  return apiFetch<HeroSlide>(`/admin/hero-slides/${id}`, {
    method: 'PUT',
    body: data,
  });
}

export async function deleteHeroSlide(id: number): Promise<void> {
  return apiFetch<void>(`/admin/hero-slides/${id}`, { method: 'DELETE' });
}

export async function subscribeNewsletter(email: string): Promise<void> {
  return apiFetch<void>('/newsletter/subscribe', {
    method: 'POST',
    body: { email },
  });
}

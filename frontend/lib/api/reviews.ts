import { apiGet, apiDelete, apiFetch } from './apiFetch';
import type { Review } from '../../types';
import type { PaginatedResponse } from '../../types/api';

export const reviewsApi = {
  getProductReviews: (productId: string, page = 1) =>
    apiGet<PaginatedResponse<Review>>(`/api/v1/products/${productId}/reviews?page=${page}`),
  canReview: (productId: string) =>
    apiGet<{ canReview: boolean }>(`/api/v1/products/${productId}/reviews/can-review`),
  createReview: (productId: string, data: FormData) =>
    apiFetch<Review>(`/api/v1/products/${productId}/reviews`, {
      method: 'POST',
      body: data,
    }),
  adminDeleteReview: (id: string) => apiDelete<null>(`/api/v1/admin/reviews/${id}`),
};

export const getReviews = (productId: string, cursor?: string) => {
  const qs = new URLSearchParams({ productId });
  if (cursor) qs.set('cursor', cursor);
  return apiFetch<PaginatedResponse<Review>>(`/api/v1/reviews?${qs.toString()}`);
};

export const createReview = (payload: { productId: string; rating: number; comment?: string }) =>
  apiFetch<Review>('/api/v1/reviews', { method: 'POST', body: JSON.stringify(payload) });

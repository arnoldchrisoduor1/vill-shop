import { apiFetch } from './apiFetch';
import type { Review } from '@/types/review';
import type { ReviewFormData } from '@/validators';

export async function getProductReviews(productId: number): Promise<Review[]> {
  return apiFetch<Review[]>(`/products/${productId}/reviews`);
}

export async function createReview(
  productId: number,
  data: ReviewFormData,
): Promise<Review> {
  return apiFetch<Review>(`/products/${productId}/reviews`, {
    method: 'POST',
    body: data,
  });
}

export async function deleteReview(reviewId: number): Promise<void> {
  return apiFetch<void>(`/reviews/${reviewId}`, { method: 'DELETE' });
}

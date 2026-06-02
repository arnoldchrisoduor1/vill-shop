import { apiGet, apiPost, apiPatch, apiDelete, apiFetch } from './apiFetch';
import type { HeroSlide } from '../../types';

export const heroSlidesApi = {
  getAll: () => apiGet<HeroSlide[]>('/api/v1/hero-slides'),
  getAdminAll: () => apiGet<HeroSlide[]>('/api/v1/admin/hero-slides'),
  create: (data: FormData | object) =>
    apiFetch<HeroSlide>('/api/v1/hero-slides', {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  update: (id: string, data: FormData | object) =>
    apiFetch<HeroSlide>(`/api/v1/hero-slides/${id}`, {
      method: 'PATCH',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  delete: (id: string) => apiDelete<null>(`/api/v1/hero-slides/${id}`),
  reorder: (slides: { id: string; sortOrder: number }[]) =>
    apiPost<HeroSlide[]>('/api/v1/hero-slides/reorder', { slides }),
  toggleActive: (id: string) => apiPatch<HeroSlide>(`/api/v1/hero-slides/${id}/active`),
};

export const getHeroSlides = () =>
  apiFetch<HeroSlide[]>('/api/v1/hero-slides');

export const adminGetHeroSlides = () =>
  apiFetch<HeroSlide[]>('/api/v1/admin/hero-slides');

export const adminCreateHeroSlide = (data: Partial<HeroSlide>) =>
  apiFetch<HeroSlide>('/api/v1/admin/hero-slides', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const adminUpdateHeroSlide = (id: string, data: Partial<HeroSlide>) =>
  apiFetch<HeroSlide>(`/api/v1/admin/hero-slides/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const adminDeleteHeroSlide = (id: string) =>
  apiFetch<null>(`/api/v1/admin/hero-slides/${id}`, { method: 'DELETE' });

export const adminReorderHeroSlides = (slides: Array<{ id: string; sortOrder: number }>) =>
  apiFetch<HeroSlide[]>('/api/v1/admin/hero-slides/reorder', {
    method: 'POST',
    body: JSON.stringify({ slides }),
  });

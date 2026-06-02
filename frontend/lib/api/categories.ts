import { apiGet, apiPost, apiPatch, apiDelete, apiFetch } from './apiFetch';
import type { Category } from '../../types';

export const categoriesApi = {
  getAll: () => apiGet<Category[]>('/api/v1/categories'),
  getBySlug: (slug: string) => apiGet<Category>(`/api/v1/categories/${slug}`),
  create: (data: Partial<Category>) => apiPost<Category>('/api/v1/categories', data),
  update: (id: string, data: Partial<Category>) => apiPatch<Category>(`/api/v1/categories/${id}`, data),
  delete: (id: string) => apiDelete<null>(`/api/v1/categories/${id}`),
};

export const getCategories = () =>
  apiFetch<Category[]>('/api/v1/categories');

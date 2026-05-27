import { apiFetch } from './apiFetch';
import type { Category } from '@/types/category';

export async function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('/categories');
}

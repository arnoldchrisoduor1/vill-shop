import { apiGet, apiPatch, apiFetch } from './apiFetch';
import type { FeatureFlag } from '../../types';

export const featuresApi = {
  getAll: () => apiGet<FeatureFlag[]>('/api/v1/features'),
  getFlag: (name: string) => apiGet<FeatureFlag>(`/api/v1/features/${name}`),
  toggle: (name: string) => apiPatch<FeatureFlag>(`/api/v1/features/${name}`),
};

export const getFeatures = () =>
  apiFetch<FeatureFlag[]>('/api/v1/features');

export const getFeature = (name: string) =>
  apiFetch<FeatureFlag>(`/api/v1/features/${name}`);

export const adminGetFeatures = () =>
  apiFetch<FeatureFlag[]>('/api/v1/admin/features');

export const adminToggleFeature = (name: string, isEnabled: boolean) =>
  apiFetch<FeatureFlag>(`/api/v1/admin/features/${name}`, {
    method: 'PATCH',
    body: JSON.stringify({ isEnabled }),
  });

import { apiFetch } from './apiFetch';
import { normalizeFeatureFlags } from './normalize';
import type { FeatureFlag } from '@/types/feature';

export async function getFeatures(): Promise<FeatureFlag[]> {
  const data = await apiFetch<unknown>('/features');
  return normalizeFeatureFlags(data);
}

export async function getAdminFeatures(): Promise<FeatureFlag[]> {
  const data = await apiFetch<unknown>('/admin/feature-flags');
  return normalizeFeatureFlags(data);
}

export async function updateFeature(
  key: string,
  enabled: boolean,
  payload?: Record<string, unknown>,
): Promise<FeatureFlag> {
  const flag = await apiFetch<Record<string, unknown>>(`/admin/feature-flags/${key}`, {
    method: 'PUT',
    body: { enabled, payload },
  });

  return {
    key: String(flag.key),
    name: String(flag.key).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    description: flag.description as string | undefined,
    enabled: Boolean(flag.enabled),
    value: flag.payload as FeatureFlag['value'],
  };
}

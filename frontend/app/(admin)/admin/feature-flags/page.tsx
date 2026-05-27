'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, Toggle } from '@/components/ui';
import { getAdminFeatures, updateFeature } from '@/lib/api/features';
import type { FeatureFlag } from '@/types';

export default function AdminFeatureFlagsPage() {
  const [features, setFeatures] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    getAdminFeatures()
      .then(setFeatures)
      .catch(() => setFeatures([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleToggle = async (feature: FeatureFlag) => {
    try {
      await updateFeature(feature.key, !feature.enabled);
      toast.success(`${feature.name} ${!feature.enabled ? 'enabled' : 'disabled'}`);
      load();
    } catch {
      toast.error('Failed to update feature flag');
    }
  };

  if (loading) return <p className="text-muted">Loading feature flags...</p>;

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">Feature Flags</h1>
      <div className="grid max-w-2xl gap-4">
        {features.map((feature) => (
          <Card key={feature.key}>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{feature.name}</h3>
                  {feature.description && (
                    <p className="mt-1 text-sm text-muted">{feature.description}</p>
                  )}
                  <p className="mt-1 font-mono text-xs text-muted">{feature.key}</p>
                </div>
                <Toggle
                  checked={feature.enabled}
                  onChange={() => handleToggle(feature)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
        {features.length === 0 && (
          <p className="text-muted">No feature flags configured</p>
        )}
      </div>
    </div>
  );
}

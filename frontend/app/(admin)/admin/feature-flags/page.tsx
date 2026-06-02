'use client';

import { useEffect, useState } from 'react';
import { featuresApi } from '../../../../lib/api/features';
import { Toggle } from '../../../../components/ui/Toggle';
import { Skeleton } from '../../../../components/ui/Skeleton';
import { toast } from 'sonner';
import type { FeatureFlag } from '../../../../types';

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    featuresApi.getAll().then(setFlags).catch(() => setFlags([])).finally(() => setIsLoading(false));
  }, []);

  const handleToggle = async (name: string) => {
    try {
      const updated = await featuresApi.toggle(name);
      setFlags((prev) => prev.map((f) => f.name === name ? updated : f));
      toast.success(`${name} ${updated.isEnabled ? 'enabled' : 'disabled'}`);
    } catch { toast.error('Failed to toggle flag'); }
  };

  if (isLoading) return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Feature Flags</h1>
      <div className="bg-[var(--color-surface)] rounded-[var(--radius)] border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
        {flags.map((flag) => (
          <div key={flag.name} className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="font-medium capitalize">{flag.name.replace(/_/g, ' ')}</p>
              {flag.description && <p className="text-sm text-[var(--color-text-muted)]">{flag.description}</p>}
            </div>
            <Toggle checked={flag.isEnabled} onChange={() => handleToggle(flag.name)} />
          </div>
        ))}
        {flags.length === 0 && <p className="text-center py-8 text-[var(--color-text-muted)]">No feature flags.</p>}
      </div>
    </div>
  );
}

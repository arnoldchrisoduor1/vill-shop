'use client';

import { usePathname } from 'next/navigation';
import { useFeatures } from '../context/FeatureContext';

export function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { useFeature, isLoading } = useFeatures();
  const maintenanceOn = useFeature('maintenance_mode');

  if (isLoading) return null;

  if (maintenanceOn && !pathname.startsWith('/admin') && !pathname.startsWith('/login')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-2">We&apos;ll be back soon</h1>
          <p className="text-[var(--color-text-muted)]">
            Vill Shop is undergoing maintenance. Please check again later.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

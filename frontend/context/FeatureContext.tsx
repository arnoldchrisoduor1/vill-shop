'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as featuresApi from '@/lib/api/features';
import type { FeatureFlag, FeatureKey } from '@/types/feature';

interface FeatureContextValue {
  features: FeatureFlag[];
  isLoading: boolean;
  isEnabled: (key: FeatureKey | string) => boolean;
  getValue: <T = string | number | boolean>(key: FeatureKey | string) => T | undefined;
  refreshFeatures: () => Promise<void>;
}

const FeatureContext = createContext<FeatureContextValue | null>(null);

export function FeatureProvider({ children }: { children: ReactNode }) {
  const [features, setFeatures] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshFeatures = useCallback(async () => {
    try {
      const data = await featuresApi.getFeatures();
      setFeatures(data);
    } catch {
      setFeatures([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshFeatures();
  }, [refreshFeatures]);

  const isEnabled = useCallback(
    (key: FeatureKey | string) => {
      const feature = features.find((f) => f.key === key);
      return feature?.enabled ?? false;
    },
    [features],
  );

  const getValue = useCallback(
    <T,>(key: FeatureKey | string): T | undefined => {
      const feature = features.find((f) => f.key === key);
      return feature?.value as T | undefined;
    },
    [features],
  );

  const value = useMemo(
    () => ({ features, isLoading, isEnabled, getValue, refreshFeatures }),
    [features, isLoading, isEnabled, getValue, refreshFeatures],
  );

  return (
    <FeatureContext.Provider value={value}>{children}</FeatureContext.Provider>
  );
}

export function useFeature(key: FeatureKey | string): boolean {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error('useFeature must be used within FeatureProvider');
  }
  return context.isEnabled(key);
}

export function useFeatures() {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error('useFeatures must be used within FeatureProvider');
  }
  return context;
}

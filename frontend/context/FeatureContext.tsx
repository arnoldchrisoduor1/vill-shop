'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { featuresApi } from '../lib/api/features';
import type { FeatureFlag } from '../types';

interface FeatureContextValue {
  flags: FeatureFlag[];
  isLoading: boolean;
  useFeature: (name: string) => boolean;
  getFlag: (name: string) => FeatureFlag | undefined;
}

const FeatureContext = createContext<FeatureContextValue | null>(null);

export function FeatureProvider({ children }: { children: React.ReactNode }) {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    featuresApi
      .getAll()
      .then(setFlags)
      .catch(() => setFlags([]))
      .finally(() => setIsLoading(false));
  }, []);

  const useFeature = (name: string) =>
    flags.find((f) => f.name === name)?.isEnabled ?? false;

  const getFlag = (name: string) => flags.find((f) => f.name === name);

  return (
    <FeatureContext.Provider value={{ flags, isLoading, useFeature, getFlag }}>
      {children}
    </FeatureContext.Provider>
  );
}

export function useFeatures() {
  const ctx = useContext(FeatureContext);
  if (!ctx) throw new Error('useFeatures must be used within FeatureProvider');
  return ctx;
}

export function useFeature(name: string): boolean {
  const { useFeature: uf } = useFeatures();
  return uf(name);
}

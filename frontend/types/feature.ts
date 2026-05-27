export interface FeatureFlag {
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  value?: string | number | boolean;
}

export type FeatureKey = 'tax' | 'reviews' | 'wishlist' | 'newsletter' | 'events';

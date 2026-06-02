export interface FeatureFlag {
  name: string;
  isEnabled: boolean;
  value?: Record<string, unknown>;
  description?: string;
}

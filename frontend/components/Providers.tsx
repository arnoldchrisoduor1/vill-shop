'use client';

import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { FeatureProvider } from '../context/FeatureContext';
import { MaintenanceGate } from './MaintenanceGate';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <FeatureProvider>
        <MaintenanceGate>
          <CartProvider>{children}</CartProvider>
        </MaintenanceGate>
      </FeatureProvider>
    </AuthProvider>
  );
}

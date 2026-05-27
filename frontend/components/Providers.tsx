'use client';

import { Toaster } from 'sonner';
import { AuthProvider, CartProvider, FeatureProvider } from '@/context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <FeatureProvider>
        <CartProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                fontFamily: 'var(--font-body)',
              },
            }}
          />
        </CartProvider>
      </FeatureProvider>
    </AuthProvider>
  );
}

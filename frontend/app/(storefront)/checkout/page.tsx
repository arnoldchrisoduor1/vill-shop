'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutSchema, type CheckoutFormData } from '../../../validators/checkout';
import { useCartStore } from '../../../lib/store/cartStore';
import { useCartActions } from '../../../lib/hooks/useCartActions';
import { useUiStore } from '../../../lib/store/uiStore';
import { useAuth } from '../../../context/AuthContext';
import { ordersApi } from '../../../lib/api/orders';
import { apiFetch } from '../../../lib/api/apiFetch';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Dropdown } from '../../../components/ui/Dropdown';
import { formatPrice } from '../../../lib/utils';
import { CURRENCIES } from '../../../lib/constants';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const { syncGuestCartToServer } = useCartActions();
  const { user } = useAuth();
  const { currency, setCurrency } = useUiStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [cartReady, setCartReady] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      router.push('/login?redirect=/checkout');
      return;
    }
    let cancelled = false;
    syncGuestCartToServer().finally(() => {
      if (!cancelled) setCartReady(true);
    });
    return () => { cancelled = true; };
  }, [user?.id, router, syncGuestCartToServer]);

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { currency },
  });

  const onSubmit = async (data: CheckoutFormData) => {
    setIsLoading(true);
    try {
      await syncGuestCartToServer();
      if (useCartStore.getState().items.length === 0) {
        toast.error('Your cart is empty');
        return;
      }

      const order = await ordersApi.createOrder({
        currency: data.currency,
        shippingAddress: {
          name: data.name,
          address: data.address,
          city: data.city,
          phone: data.phone,
        },
      });

      // Initiate Pesapal payment
      const paymentRes = await apiFetch<{ redirectUrl: string }>('/api/v1/payments/initiate', {
        method: 'POST',
        body: JSON.stringify({ orderId: order.id }),
      });

      if (!paymentRes.data?.redirectUrl) {
        toast.error('Payment could not be started');
        return;
      }

      clearCart();
      window.location.href = paymentRes.data.redirectUrl;
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Checkout failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!cartReady) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-[var(--color-text-muted)]">Loading your cart...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-[var(--color-text-muted)]">Your cart is empty.</p>
        <a href="/products" className="text-[var(--color-primary)] text-sm mt-2 block">Go Shopping</a>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Checkout form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <h2 className="text-lg font-semibold">Shipping Details</h2>
          <Input label="Full Name" {...register('name')} error={errors.name?.message} />
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
          <Input label="Phone" type="tel" {...register('phone')} error={errors.phone?.message} />
          <Input label="Address" {...register('address')} error={errors.address?.message} />
          <Input label="City" {...register('city')} error={errors.city?.message} />

          <div>
            <label className="block text-sm font-medium mb-1">Currency</label>
            <Dropdown
              options={CURRENCIES.map((c) => ({ value: c.code, label: `${c.code} - ${c.label}` }))}
              value={currency}
              onChange={(val) => setCurrency(val)}
            />
          </div>

          <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
            Move to Payments
          </Button>
        </form>

        {/* Order summary */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="bg-[var(--color-surface)] rounded-[var(--radius)] border border-[var(--color-border)] p-6 space-y-4">
            {items.map((item) => {
              const price = item.variant?.priceKes ?? item.product.priceKes;
              return (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.product.name} {item.variant ? `(${item.variant.name})` : ''} × {item.quantity}</span>
                  <span>{formatPrice(Number(price) * item.quantity)}</span>
                </div>
              );
            })}
            <div className="border-t border-[var(--color-border)] pt-4 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-[var(--color-primary)]">{formatPrice(getTotal())}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

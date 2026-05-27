'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button, Input, Textarea, Card, CardContent } from '@/components/ui';
import { useAuth } from '@/context';
import { useFeature } from '@/context';
import { useCartStore } from '@/lib/store';
import { createOrder } from '@/lib/api/orders';
import { checkoutSchema, type CheckoutFormData } from '@/validators';
import { ApiFetchError } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const taxEnabled = useFeature('tax');
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const clearItems = useCartStore((s) => s.clearItems);
  const [isLoading, setIsLoading] = useState(false);

  const taxRate = 0.16;
  const taxAmount = taxEnabled ? subtotal * taxRate : 0;
  const total = subtotal + taxAmount;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      first_name: user?.name?.split(' ')[0] ?? '',
      last_name: user?.name?.split(' ').slice(1).join(' ') ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      country: 'Kenya',
    },
  });

  if (items.length === 0) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted">Add items before checking out</p>
      </div>
    );
  }

  const onSubmit = async (data: CheckoutFormData) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to complete your order');
      router.push('/login?redirect=/checkout');
      return;
    }

    setIsLoading(true);
    try {
      const { order, payment } = await createOrder(data);
      clearItems();
      toast.success('Order placed successfully!');
      if (payment?.redirect_url || payment?.payment_url) {
        window.location.href = payment.redirect_url ?? payment.payment_url ?? `/orders/${order.order_number}/success`;
        return;
      }
      router.push(`/orders/${order.order_number}/success`);
    } catch (err) {
      const message =
        err instanceof ApiFetchError ? err.message : 'Checkout failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-page py-8">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          <Card>
            <CardContent>
              <h2 className="mb-4 text-lg font-semibold">Shipping Information</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="First Name"
                  error={errors.first_name?.message}
                  {...register('first_name')}
                />
                <Input
                  label="Last Name"
                  error={errors.last_name?.message}
                  {...register('last_name')}
                />
                <Input
                  label="Email"
                  type="email"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Input
                  label="Phone"
                  type="tel"
                  error={errors.phone?.message}
                  {...register('phone')}
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Address Line 1"
                    error={errors.address_line1?.message}
                    {...register('address_line1')}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="Address Line 2 (optional)"
                    error={errors.address_line2?.message}
                    {...register('address_line2')}
                  />
                </div>
                <Input
                  label="City"
                  error={errors.city?.message}
                  {...register('city')}
                />
                <Input
                  label="State/County"
                  error={errors.state?.message}
                  {...register('state')}
                />
                <Input
                  label="Postal Code"
                  error={errors.postal_code?.message}
                  {...register('postal_code')}
                />
                <Input
                  label="Country"
                  error={errors.country?.message}
                  {...register('country')}
                />
                <div className="sm:col-span-2">
                  <Textarea
                    label="Order Notes (optional)"
                    error={errors.notes?.message}
                    {...register('notes')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="sticky top-24">
            <CardContent>
              <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
              <div className="space-y-2 text-sm">
                {items.map((item) => (
                  <div key={item.product_id} className="flex justify-between">
                    <span className="text-muted">
                      {item.product?.name} × {item.quantity}
                    </span>
                    <span>
                      {formatCurrency((item.product?.price ?? 0) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="my-4 border-t border-border" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {taxEnabled && (
                  <div className="flex justify-between">
                    <span className="text-muted">Tax (16%)</span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>
                )}
              </div>
              <div className="my-4 border-t border-border" />
              <div className="mb-6 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                Place Order
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </form>
    </div>
  );
}

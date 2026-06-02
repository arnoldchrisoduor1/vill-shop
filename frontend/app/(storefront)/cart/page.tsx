'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/ui/Button';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCartStore();
  const cartTotal = total();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] mb-8">
        Shopping Cart
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="h-20 w-20 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2">
            Your cart is empty
          </h2>
          <p className="text-[var(--color-text-muted)] mb-6">
            Add some products to get started
          </p>
          <Link href="/products">
            <Button variant="primary">Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const price = item.variant?.priceKes ?? item.product.priceKes;
              const image =
                item.product.media?.find((m) => m.isPrimary) ??
                item.product.media?.[0];

              return (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
                >
                  <div className="relative shrink-0 h-20 w-20 rounded-lg overflow-hidden bg-gray-50">
                    {image ? (
                      <Image
                        src={image.url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-gray-300" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="font-medium text-[var(--color-text)] hover:text-[var(--color-primary)] line-clamp-2"
                    >
                      {item.product.name}
                    </Link>
                    {item.variant && (
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                        {item.variant.name}
                      </p>
                    )}
                    <p className="text-sm font-bold text-[var(--color-primary)] mt-1">
                      {formatPrice(price, 'KES')} each
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="flex items-center gap-1 border border-[var(--color-border)] rounded-lg">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-medium px-2 min-w-[28px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <p className="text-sm font-bold">
                      {formatPrice(price * item.quantity, 'KES')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sticky top-24">
              <h2 className="text-base font-semibold text-[var(--color-text)] mb-4">
                Order Summary
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">
                    Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)
                  </span>
                  <span className="font-medium">{formatPrice(cartTotal, 'KES')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Shipping</span>
                  <span className="text-[var(--color-secondary)] font-medium">
                    Calculated at checkout
                  </span>
                </div>
                <div className="border-t border-[var(--color-border)] pt-2 flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-[var(--color-primary)]">
                    {formatPrice(cartTotal, 'KES')}
                  </span>
                </div>
              </div>
              <Link href="/checkout" className="block mt-5">
                <Button variant="primary" size="lg" className="w-full">
                  Proceed to Checkout
                </Button>
              </Link>
              <Link href="/products" className="block mt-2">
                <Button variant="ghost" className="w-full text-sm">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

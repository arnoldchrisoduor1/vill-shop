'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCartStore } from '../../lib/store/cartStore';
import { useCartActions } from '../../lib/hooks/useCartActions';
import { Button } from '../ui/Button';
import { formatPrice } from '../../lib/utils';
import { toast } from 'sonner';

export function CartDrawer() {
  const { items, isOpen, closeCart, getTotal } = useCartStore();
  const { removeFromCart, updateCartQuantity } = useCartActions();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const handleRemove = async (itemId: string) => {
    if (pendingId) return;
    setPendingId(itemId);
    try {
      await removeFromCart(itemId);
    } catch {
      toast.error('Failed to remove item');
    } finally {
      setPendingId(null);
    }
  };

  const handleUpdateQty = async (itemId: string, qty: number) => {
    if (pendingId) return;
    setPendingId(itemId);
    try {
      await updateCartQuantity(itemId, qty);
    } catch {
      toast.error('Failed to update quantity');
    } finally {
      setPendingId(null);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={closeCart}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-[var(--color-surface)] shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
              <h2 className="text-lg font-semibold">
                Cart ({items.length})
              </h2>
              <button onClick={closeCart} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <ShoppingBag className="h-16 w-16 text-[var(--color-border)]" />
                  <p className="text-[var(--color-text-muted)]">Your cart is empty</p>
                  <Button variant="outline" onClick={closeCart}>
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => {
                    const primaryImage = item.product.media?.find((m) => m.isPrimary) || item.product.media?.[0];
                    const price = item.variant?.priceKes ?? item.product.priceKes;
                    const isPending = pendingId === item.id;
                    return (
                      <div key={item.id} className={`flex gap-3 ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="relative h-16 w-16 flex-shrink-0 rounded-[var(--radius)] overflow-hidden bg-[var(--color-background)]">
                          {primaryImage ? (
                            <Image src={primaryImage.url} alt={item.product.name} fill className="object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <ShoppingBag className="h-6 w-6 text-[var(--color-border)]" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.product.name}</p>
                          {item.variant && (
                            <p className="text-xs text-[var(--color-text-muted)]">{item.variant.name}</p>
                          )}
                          <p className="text-sm font-semibold text-[var(--color-primary)]">
                            {formatPrice(Number(price) * item.quantity)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleRemove(item.id)}
                            disabled={!!pendingId}
                            className="text-[var(--color-text-muted)] hover:text-red-500 disabled:opacity-40"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                              disabled={!!pendingId}
                              className="p-1 rounded hover:bg-[var(--color-background)] disabled:opacity-40"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-sm w-6 text-center">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                              disabled={!!pendingId}
                              className="p-1 rounded hover:bg-[var(--color-background)] disabled:opacity-40"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-[var(--color-border)] px-6 py-4 space-y-3">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-[var(--color-primary)]">{formatPrice(getTotal())}</span>
                </div>
                <Link href="/checkout" onClick={closeCart}>
                  <Button className="w-full" size="lg">Checkout</Button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

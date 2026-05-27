'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { getOrder } from '@/lib/api/orders';
import { formatCurrency } from '@/lib/utils';
import type { Order } from '@/types';

interface OrderSuccessProps {
  orderId: string;
}

interface PageProps {
  params: { id: string };
}

export default function OrderSuccessPage({ params }: PageProps) {
  return <OrderSuccess orderId={params.id} />;
}

function OrderSuccess({ orderId }: OrderSuccessProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(orderId)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="container-page py-16 text-center text-muted">
        Loading order details...
      </div>
    );
  }

  return (
    <div className="container-page py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-lg text-center"
      >
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-secondary/10">
          <CheckCircle className="h-10 w-10 text-secondary" />
        </div>

        <h1 className="text-3xl font-bold">Order Confirmed!</h1>
        <p className="mt-2 text-muted">
          Thank you for your purchase. We&apos;ll send you a confirmation email shortly.
        </p>

        {order && (
          <div className="mt-8 rounded-xl border border-border bg-surface p-6 text-left">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-muted">Order Number</span>
              <span className="font-mono font-semibold">{order.order_number}</span>
            </div>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-muted">Status</span>
              <Badge variant="primary">{order.status}</Badge>
            </div>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-muted">Total</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(order.total, order.currency)}
              </span>
            </div>
            <div className="border-t border-border pt-4">
              <p className="mb-2 text-sm font-medium">Items</p>
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted">
                    {item.product?.name ?? `Product #${item.product_id}`} × {item.quantity}
                  </span>
                  <span>{formatCurrency(item.total_price)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/account/orders">
            <Button variant="outline">
              <Package className="h-4 w-4" />
              View Orders
            </Button>
          </Link>
          <Link href="/products">
            <Button>
              Continue Shopping
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ordersApi } from '../../../../lib/api/orders';
import { Skeleton } from '../../../../components/ui/Skeleton';
import { formatDate, formatPrice, getOrderStateColor } from '../../../../lib/utils';
import type { Order } from '../../../../types';
import { Package } from 'lucide-react';
import { toast } from 'sonner';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ordersApi.getOrders()
      .then((data) => setOrders(data.items ?? []))
      .catch(() => {
        setOrders([]);
        toast.error('Failed to load orders');
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1,2,3].map((i) => <Skeleton key={i} variant="card" className="h-24" />)}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-6">My Orders</h2>
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-[var(--color-border)] mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)]">No orders yet.</p>
          <Link href="/products" className="text-[var(--color-primary)] text-sm mt-2 block">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/account/orders/${order.id}`}>
              <div className="bg-[var(--color-surface)] rounded-[var(--radius)] border border-[var(--color-border)] p-4 hover:border-[var(--color-primary)] transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-[var(--color-text-muted)]">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getOrderStateColor(order.state)}`}>
                      {order.state}
                    </span>
                    <p className="font-semibold text-[var(--color-primary)] mt-1">
                      {formatPrice(Number(order.total), order.currency)}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-[var(--color-text-muted)] mt-2">{order.items?.length ?? 0} item(s)</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

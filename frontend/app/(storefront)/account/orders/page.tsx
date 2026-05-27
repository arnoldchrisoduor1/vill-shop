'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import { Badge, Card, CardContent } from '@/components/ui';
import { getOrders } from '@/lib/api/orders';
import { formatCurrency } from '@/lib/utils';
import type { Order } from '@/types';

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-muted">Loading orders...</p>;
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Package className="mx-auto mb-4 h-12 w-12 text-muted" />
          <h2 className="text-lg font-semibold">No orders yet</h2>
          <p className="mt-2 text-muted">Start shopping to see your orders here</p>
          <Link href="/products" className="mt-4 inline-block text-primary hover:underline">
            Browse Products
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order, i) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Card>
            <CardContent>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <Link href={`/account/orders/${order.order_number}`} className="font-mono font-semibold hover:text-primary">
                    {order.order_number}
                  </Link>
                  <p className="text-sm text-muted">
                    {new Date(order.created_at).toLocaleDateString('en-KE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <Badge variant="primary">{order.status}</Badge>
                <div className="text-right">
                  <p className="font-bold text-primary">
                    {formatCurrency(order.total, order.currency)}
                  </p>
                  <p className="text-sm text-muted">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

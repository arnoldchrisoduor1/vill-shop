'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge, Button, TableRowSkeleton } from '@/components/ui';
import {
  cancelOrder,
  deliverOrder,
  getAdminOrders,
  refundOrder,
  shipOrder,
} from '@/lib/api/orders';
import { formatCurrency } from '@/lib/utils';
import type { Order } from '@/types';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    getAdminOrders()
      .then((r) => setOrders(r.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleAction = async (id: number, action: 'ship' | 'deliver' | 'cancel' | 'refund') => {
    try {
      const handlers = {
        ship: shipOrder,
        deliver: deliverOrder,
        cancel: cancelOrder,
        refund: refundOrder,
      };
      await handlers[action](id);
      toast.success(`Order ${action === 'ship' ? 'shipped' : action === 'deliver' ? 'delivered' : `${action}ed`}`);
      load();
    } catch {
      toast.error(`Failed to ${action} order`);
    }
  };

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">Orders</h1>
      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background">
              <th className="px-4 py-3 text-left font-medium">Order #</th>
              <th className="px-4 py-3 text-left font-medium">Customer</th>
              <th className="px-4 py-3 text-left font-medium">Total</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
              : orders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-mono">{order.order_number}</td>
                    <td className="px-4 py-3">{order.customer_email ?? order.shipping_address?.email}</td>
                    <td className="px-4 py-3">{formatCurrency(order.total, order.currency)}</td>
                    <td className="px-4 py-3"><Badge>{order.status}</Badge></td>
                    <td className="px-4 py-3">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {order.status === 'processing' && (
                          <Button size="sm" variant="outline" onClick={() => handleAction(order.id, 'ship')}>
                            Ship
                          </Button>
                        )}
                        {order.status === 'shipped' && (
                          <Button size="sm" variant="outline" onClick={() => handleAction(order.id, 'deliver')}>
                            Deliver
                          </Button>
                        )}
                        {(order.status === 'pending' || order.status === 'processing') && (
                          <Button size="sm" variant="outline" onClick={() => handleAction(order.id, 'cancel')}>
                            Cancel
                          </Button>
                        )}
                        {(order.status === 'delivered' || order.status === 'shipped') && (
                          <Button size="sm" variant="outline" onClick={() => handleAction(order.id, 'refund')}>
                            Refund
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

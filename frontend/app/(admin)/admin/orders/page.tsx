'use client';

import { useEffect, useState } from 'react';
import { ordersApi } from '../../../../lib/api/orders';
import { Button } from '../../../../components/ui/Button';
import { Dropdown } from '../../../../components/ui/Dropdown';
import { Skeleton } from '../../../../components/ui/Skeleton';
import { formatPrice, formatDate, getOrderStateColor } from '../../../../lib/utils';
import { ORDER_STATES } from '../../../../lib/constants';
import { toast } from 'sonner';
import type { Order } from '../../../../types';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState('');

  useEffect(() => {
    ordersApi.adminGetOrders(1, stateFilter || undefined)
      .then((data) => setOrders(data.items ?? []))
      .catch(() => {
        setOrders([]);
        toast.error('Failed to load orders');
      })
      .finally(() => setIsLoading(false));
  }, [stateFilter]);

  const handleTransition = async (orderId: string, newState: string) => {
    try {
      const updated = await ordersApi.adminTransitionState(orderId, newState);
      setOrders((prev) => prev.map((o) => o.id === orderId ? updated : o));
      toast.success(`Order ${newState}`);
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  };

  const NEXT_STATES: Record<string, string[]> = {
    PENDING: ['AWAITING_PAYMENT', 'CANCELLED'],
    AWAITING_PAYMENT: ['PAID', 'CANCELLED'],
    PAID: ['PROCESSING', 'REFUNDED'],
    PROCESSING: ['SHIPPED'],
    SHIPPED: ['DELIVERED'],
  };

  if (isLoading) return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12" />)}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="w-48">
          <Dropdown
            options={[{ value: '', label: 'All States' }, ...ORDER_STATES.map((s) => ({ value: s, label: s }))]}
            value={stateFilter}
            onChange={setStateFilter}
          />
        </div>
      </div>
      <div className="bg-[var(--color-surface)] rounded-[var(--radius)] border border-[var(--color-border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-background)] border-b border-[var(--color-border)]">
            <tr>
              <th className="px-4 py-3 text-left">Order</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-background)]">
                <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">{order.user?.name}</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">{formatDate(order.createdAt)}</td>
                <td className="px-4 py-3 font-medium">{formatPrice(Number(order.total), order.currency)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${getOrderStateColor(order.state)}`}>
                    {order.state}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {(NEXT_STATES[order.state] ?? []).map((s) => (
                      <Button key={s} size="sm" variant="outline" onClick={() => handleTransition(order.id, s)}>
                        {s}
                      </Button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="text-center py-8 text-[var(--color-text-muted)]">No orders.</p>}
      </div>
    </div>
  );
}

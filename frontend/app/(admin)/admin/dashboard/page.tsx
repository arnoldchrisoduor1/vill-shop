'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { statsApi } from '../../../../lib/api/stats';
import { Skeleton } from '../../../../components/ui/Skeleton';
import { Badge } from '../../../../components/ui/Badge';
import { formatPrice, formatDate, getOrderStateColor } from '../../../../lib/utils';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import type { AdminDashboard } from '../../../../types';

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    statsApi.getAdminDashboard()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} variant="card" />)}</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Revenue cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Today', value: data?.revenueToday ?? 0 },
          { label: 'This Week', value: data?.revenueWeek ?? 0 },
          { label: 'This Month', value: data?.revenueMonth ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[var(--color-surface)] rounded-[var(--radius)] border border-[var(--color-border)] p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-[var(--color-primary)]" />
              <span className="text-sm font-medium text-[var(--color-text-muted)]">Revenue {label}</span>
            </div>
            <p className="text-2xl font-bold text-[var(--color-primary)]">{formatPrice(Number(value))}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-[var(--color-surface)] rounded-[var(--radius)] border border-[var(--color-border)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-[var(--color-primary)]">View all</Link>
          </div>
          <div className="space-y-3">
            {(data?.recentOrders ?? []).map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
                <div>
                  <p className="text-sm font-medium">{order.orderNumber}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{order.user?.name} · {formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${getOrderStateColor(order.state)}`}>
                    {order.state}
                  </span>
                  <p className="text-sm font-medium mt-0.5">{formatPrice(Number(order.total), order.currency)}</p>
                </div>
              </div>
            ))}
            {(data?.recentOrders ?? []).length === 0 && (
              <p className="text-sm text-[var(--color-text-muted)]">No orders yet.</p>
            )}
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-[var(--color-surface)] rounded-[var(--radius)] border border-[var(--color-border)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Low Stock Alerts
            </h2>
            <Link href="/admin/inventory" className="text-sm text-[var(--color-primary)]">Manage</Link>
          </div>
          <div className="space-y-3">
            {(data?.lowStockProducts ?? []).map((product) => (
              <div key={product.id} className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
                <div>
                  <p className="text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">SKU: {product.sku}</p>
                </div>
                <Badge variant={product.stock === 0 ? 'danger' : 'warning'}>
                  {product.stock} left
                </Badge>
              </div>
            ))}
            {(data?.lowStockProducts ?? []).length === 0 && (
              <p className="text-sm text-[var(--color-text-muted)]">No low stock products.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

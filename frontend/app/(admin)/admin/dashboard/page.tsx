'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, Skeleton } from '@/components/ui';
import { getDashboardStats } from '@/lib/api/stats';
import { formatCurrency } from '@/lib/utils';
import type { DashboardStats } from '@/types';

const statCards = [
  { key: 'total_revenue', label: 'Total Revenue', icon: DollarSign, format: 'currency' },
  { key: 'total_orders', label: 'Total Orders', icon: ShoppingBag, format: 'number' },
  { key: 'total_customers', label: 'Customers', icon: Users, format: 'number' },
  { key: 'total_products', label: 'Products', icon: Package, format: 'number' },
] as const;

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          const value = stats?.[card.key as keyof DashboardStats];
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted">{card.label}</p>
                      {loading ? (
                        <Skeleton height={28} width={100} className="mt-1" />
                      ) : (
                        <p className="mt-1 text-2xl font-bold">
                          {card.format === 'currency'
                            ? formatCurrency(Number(value) || 0)
                            : Number(value)?.toLocaleString() ?? '—'}
                        </p>
                      )}
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {!loading && stats && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-secondary" />
                <h2 className="font-semibold">Performance</h2>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Revenue Change</span>
                  <span className={stats.revenue_change >= 0 ? 'text-secondary' : 'text-error'}>
                    {stats.revenue_change >= 0 ? '+' : ''}
                    {stats.revenue_change.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Orders Change</span>
                  <span className={stats.orders_change >= 0 ? 'text-secondary' : 'text-error'}>
                    {stats.orders_change >= 0 ? '+' : ''}
                    {stats.orders_change.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Customers Change</span>
                  <span className={stats.customers_change >= 0 ? 'text-secondary' : 'text-error'}>
                    {stats.customers_change >= 0 ? '+' : ''}
                    {stats.customers_change.toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <h2 className="font-semibold">Inventory Alerts</h2>
              </div>
              <p className="mt-4 text-3xl font-bold text-warning">
                {stats.low_stock_count}
              </p>
              <p className="text-sm text-muted">products with low stock</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

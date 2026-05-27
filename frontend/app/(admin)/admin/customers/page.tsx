'use client';

import { useEffect, useState } from 'react';
import { TableRowSkeleton } from '@/components/ui';
import { getCustomers } from '@/lib/api/stats';
import type { User } from '@/types';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCustomers({ page: 1 })
      .then((r) => setCustomers(r.data))
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">Customers</h1>
      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background">
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Phone</th>
              <th className="px-4 py-3 text-left font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)
              : customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium">{customer.name}</td>
                    <td className="px-4 py-3">{customer.email}</td>
                    <td className="px-4 py-3 text-muted">{customer.phone ?? '—'}</td>
                    <td className="px-4 py-3">{new Date(customer.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

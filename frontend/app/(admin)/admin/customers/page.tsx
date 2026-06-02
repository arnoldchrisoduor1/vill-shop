'use client';

import { useEffect, useState } from 'react';
import { usersApi } from '../../../../lib/api/users';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Skeleton } from '../../../../components/ui/Skeleton';
import { formatDate } from '../../../../lib/utils';
import { toast } from 'sonner';
import type { User } from '../../../../types';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    usersApi.adminGetAll().then((data) => setCustomers((data as unknown as { items: User[] }).items ?? [])).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  const handleBanToggle = async (user: User) => {
    try {
      if (user.isBanned) {
        await usersApi.adminUnban(user.id);
        toast.success('User unbanned');
      } else {
        await usersApi.adminBan(user.id);
        toast.success('User banned');
      }
      setCustomers((prev) => prev.map((u) => u.id === user.id ? { ...u, isBanned: !u.isBanned } : u));
    } catch { toast.error('Action failed'); }
  };

  if (isLoading) return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12" />)}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Customers</h1>
      <div className="bg-[var(--color-surface)] rounded-[var(--radius)] border border-[var(--color-border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-background)] border-b border-[var(--color-border)]">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Joined</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-background)]">
                <td className="px-4 py-3 font-medium">{customer.name}</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">{customer.email}</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">{formatDate(customer.createdAt)}</td>
                <td className="px-4 py-3">
                  <Badge variant={customer.isBanned ? 'danger' : 'success'}>
                    {customer.isBanned ? 'Banned' : 'Active'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Button size="sm" variant={customer.isBanned ? 'outline' : 'danger'} onClick={() => handleBanToggle(customer)}>
                    {customer.isBanned ? 'Unban' : 'Ban'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && <p className="text-center py-8 text-[var(--color-text-muted)]">No customers.</p>}
      </div>
    </div>
  );
}

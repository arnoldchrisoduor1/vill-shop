'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { AdminSidebar } from '../../components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-[var(--color-background)] p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}

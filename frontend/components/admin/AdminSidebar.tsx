'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Calendar,
  Image,
  ToggleLeft,
  BarChart3,
  Archive,
  FolderTree,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/inventory', label: 'Inventory', icon: Archive },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/events', label: 'Events', icon: Calendar },
  { href: '/admin/landing/hero', label: 'Hero Slides', icon: Image },
  { href: '/admin/feature-flags', label: 'Feature Flags', icon: ToggleLeft },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 min-h-screen bg-[var(--color-text)] text-white flex flex-col">
      <div className="px-6 py-4 border-b border-white/10">
        <Link href="/admin/dashboard" className="text-xl font-bold text-[var(--color-primary)]">
          Vill Shop
        </Link>
        <p className="text-xs text-white/50 mt-1">Admin Panel</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-[var(--radius)] text-sm font-medium transition-colors',
              pathname.startsWith(href)
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-white/70 hover:text-white hover:bg-white/10',
            )}>
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="px-6 py-4 border-t border-white/10">
        <Link href="/" className="text-xs text-white/50 hover:text-white transition-colors">← Back to Store</Link>
      </div>
    </aside>
  );
}

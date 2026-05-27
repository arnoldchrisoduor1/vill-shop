'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Package,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const accountLinks = [
  { href: '/account', label: 'Profile', icon: User },
  { href: '/account/orders', label: 'Orders', icon: Package },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="container-page py-8">
      <h1 className="mb-8 text-3xl font-bold">My Account</h1>
      <div className="grid gap-8 lg:grid-cols-4">
        <nav className="space-y-1">
          {accountLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted hover:bg-border/50 hover:text-foreground',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                  {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                </motion.div>
              </Link>
            );
          })}
        </nav>
        <div className="lg:col-span-3">{children}</div>
      </div>
    </div>
  );
}

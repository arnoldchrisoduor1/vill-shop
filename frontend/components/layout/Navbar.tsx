'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  Search,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import { Button, Dropdown } from '@/components/ui';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { useAuth } from '@/context';
import { useCartStore, useUiStore, useWishlistStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/products', label: 'Shop' },
  { href: '/events', label: 'Events' },
  { href: '/products?is_on_sale=true', label: 'Sale' },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const cartCount = useCartStore((s) => s.itemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const { mobileMenuOpen, setMobileMenuOpen } = useUiStore();
  const openCart = useCartStore((s) => s.openDrawer);

  const userMenuItems = [
    { label: 'My Account', value: 'account', icon: <User className="h-4 w-4" />, onClick: () => window.location.href = '/account' },
    { label: 'Orders', value: 'orders', icon: <ShoppingBag className="h-4 w-4" />, onClick: () => window.location.href = '/account/orders' },
    { label: 'Wishlist', value: 'wishlist', icon: <Heart className="h-4 w-4" />, onClick: () => window.location.href = '/account/wishlist' },
    ...(isAdmin
      ? [{ label: 'Admin', value: 'admin', icon: <LayoutDashboard className="h-4 w-4" />, onClick: () => window.location.href = '/admin/dashboard' }]
      : []),
    { label: 'Logout', value: 'logout', icon: <LogOut className="h-4 w-4" />, onClick: () => logout() },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-md">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
            <ShoppingBag className="h-6 w-6" />
            <span className="hidden sm:inline">Vill Shop</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium hover:text-primary',
                  pathname === link.href ? 'text-primary' : 'text-muted',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/products"
              className="hidden rounded-lg p-2 text-muted hover:bg-border/50 hover:text-foreground sm:inline-flex"
            >
              <Search className="h-5 w-5" />
            </Link>

            <Link
              href="/account/wishlist"
              className="relative rounded-lg p-2 text-muted hover:bg-border/50 hover:text-foreground"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={openCart}
              className="relative rounded-lg p-2 text-muted hover:bg-border/50 hover:text-foreground"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <Dropdown
                trigger={
                  <span className="hidden items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium sm:inline-flex">
                    <User className="h-5 w-5" />
                    {user?.name?.split(' ')[0]}
                  </span>
                }
                items={userMenuItems}
                align="right"
              />
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </div>
            )}

            <button
              type="button"
              className="rounded-lg p-2 text-muted md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-border md:hidden"
            >
              <nav className="container-page flex flex-col gap-2 py-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-primary/5"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                {!isAuthenticated && (
                  <div className="mt-2 flex gap-2">
                    <Link href="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full" size="sm">Sign In</Button>
                    </Link>
                    <Link href="/register" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full" size="sm">Register</Button>
                    </Link>
                  </div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <CartDrawer />
    </>
  );
}

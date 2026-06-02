'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  User,
  Menu,
  X,
  LogOut,
  Settings,
  Package,
  Heart,
  LayoutDashboard,
} from 'lucide-react';
import { useCartStore } from '../../lib/store/cartStore';
import { useUiStore } from '../../lib/store/uiStore';
import { useAuth } from '../../context/AuthContext';
import { Dropdown } from '../ui/Dropdown';
import { CURRENCIES } from '../../lib/constants';
import { setCurrency } from '../../lib/cookies';

export function Navbar() {
  const { user, logout } = useAuth();
  const itemCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const openCart = useCartStore((state) => state.openCart);
  const { currency, setCurrency: setStoreCurrency } = useUiStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCurrencyChange = (code: string) => {
    setStoreCurrency(code);
    setCurrency(code);
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/events', label: 'Events' },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-[var(--color-primary)]">Vill Shop</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {user?.role === 'admin' && (
              <Link
                href="/admin/dashboard"
                className="hidden md:inline-flex items-center gap-2 rounded-[var(--radius)] bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)] transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            )}
            {/* Currency picker */}
            <div className="hidden md:block w-28">
              <Dropdown
                options={CURRENCIES.map((c) => ({ value: c.code, label: c.code }))}
                value={currency}
                onChange={handleCurrencyChange}
              />
            </div>

            {/* Cart button */}
            <button
              onClick={openCart}
              className="relative p-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] font-bold text-white">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1 p-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                >
                  <User className="h-5 w-5" />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute right-0 mt-1 w-48 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg"
                    >
                      <div className="px-4 py-2 border-b border-[var(--color-border)]">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-xs text-[var(--color-text-muted)] truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link href="/account" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-[var(--color-background)] transition-colors">
                          <Package className="h-4 w-4" /> My Orders
                        </Link>
                        <Link href="/account/wishlist" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-[var(--color-background)] transition-colors">
                          <Heart className="h-4 w-4" /> Wishlist
                        </Link>
                        {user.role === 'admin' && (
                          <Link href="/admin/dashboard" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-[var(--color-background)] transition-colors">
                            <Settings className="h-4 w-4" /> Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4" /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login" className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
                  Login
                </Link>
                <Link href="/register"
                  className="rounded-[var(--radius)] bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)] transition-colors">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[var(--color-text-muted)]"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-[var(--color-border)] overflow-hidden"
          >
            <div className="px-4 py-3 space-y-2">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-medium text-[var(--color-text)]">
                  {link.label}
                </Link>
              ))}
              {!user && (
                <div className="flex gap-2 pt-2">
                  <Link href="/login" className="flex-1 text-center rounded-[var(--radius)] border border-[var(--color-border)] py-2 text-sm">Login</Link>
                  <Link href="/register" className="flex-1 text-center rounded-[var(--radius)] bg-[var(--color-primary)] py-2 text-sm text-white">Register</Link>
                </div>
              )}
              {user?.role === 'admin' && (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 text-sm font-medium text-[var(--color-primary)]"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Admin Dashboard
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

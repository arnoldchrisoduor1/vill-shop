'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { LayoutGrid, List, Search } from 'lucide-react';
import { Input } from '../ui/Input';
import type { Category } from '../../types';

interface ProductsToolbarProps {
  categories: Category[];
  currentCategory?: string;
  currentQuery?: string;
  currentView?: string;
  productCount: number;
  title?: string;
}

export function ProductsToolbar({
  categories,
  currentCategory,
  currentQuery,
  currentView,
  productCount,
  title,
}: ProductsToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentQuery ?? '');

  useEffect(() => {
    setSearch(currentQuery ?? '');
  }, [currentQuery]);

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = search.trim();
      if (trimmed === (currentQuery ?? '')) return;
      updateParams({ q: trimmed || null });
    }, 350);
    return () => clearTimeout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const view = currentView === 'list' ? 'list' : 'grid';
  const heading =
    title ??
    (currentQuery
      ? `Results for "${currentQuery}"`
      : currentCategory
        ? categories.find((c) => c.slug === currentCategory)?.name ?? 'Products'
        : 'All Products');

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{heading}</h1>
          <p className="text-sm text-[var(--color-text-muted)]">{productCount} products</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="pl-9"
            />
          </div>
          <div className="flex rounded-[var(--radius)] border border-[var(--color-border)] overflow-hidden">
            <button
              type="button"
              onClick={() => updateParams({ view: null })}
              className={`p-2 ${view === 'grid' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface)] text-[var(--color-text-muted)]'}`}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => updateParams({ view: 'list' })}
              className={`p-2 ${view === 'list' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface)] text-[var(--color-text-muted)]'}`}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => updateParams({ category: null })}
          className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
            !currentCategory
              ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
              : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => updateParams({ category: cat.slug })}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              currentCategory === cat.slug
                ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}

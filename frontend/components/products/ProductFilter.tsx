'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import * as Slider from '@radix-ui/react-slider';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { useUiStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface ProductFilterProps {
  onFilterChange?: () => void;
}

export function ProductFilter({ onFilterChange }: ProductFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { filterDrawerOpen, setFilterDrawerOpen } = useUiStore();

  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [category, setCategory] = useState(searchParams.get('category') ?? '');
  const [sort, setSort] = useState(searchParams.get('sort') ?? '');
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get('min_price')) || 0,
    Number(searchParams.get('max_price')) || 100000,
  ]);
  const [isOnSale, setIsOnSale] = useState(searchParams.get('is_on_sale') === 'true');
  const [isNew, setIsNew] = useState(searchParams.get('is_new') === 'true');
  const [isFeatured, setIsFeatured] = useState(
    searchParams.get('is_featured') === 'true',
  );

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (sort) params.set('sort', sort);
    if (priceRange[0] > 0) params.set('min_price', String(priceRange[0]));
    if (priceRange[1] < 100000) params.set('max_price', String(priceRange[1]));
    if (isOnSale) params.set('is_on_sale', 'true');
    if (isNew) params.set('is_new', 'true');
    if (isFeatured) params.set('is_featured', 'true');

    router.push(`/products?${params.toString()}`);
    setFilterDrawerOpen(false);
    onFilterChange?.();
  }, [
    search,
    category,
    sort,
    priceRange,
    isOnSale,
    isNew,
    isFeatured,
    router,
    setFilterDrawerOpen,
    onFilterChange,
  ]);

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setSort('');
    setPriceRange([0, 100000]);
    setIsOnSale(false);
    setIsNew(false);
    setIsFeatured(false);
    router.push('/products');
    setFilterDrawerOpen(false);
  };

  useEffect(() => {
    setSearch(searchParams.get('search') ?? '');
    setCategory(searchParams.get('category') ?? '');
    setSort(searchParams.get('sort') ?? '');
    setIsOnSale(searchParams.get('is_on_sale') === 'true');
    setIsNew(searchParams.get('is_new') === 'true');
    setIsFeatured(searchParams.get('is_featured') === 'true');
  }, [searchParams]);

  const filterContent = (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium">Search</label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Categories</option>
          {PRODUCT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Sort By</label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Default</option>
          <option value="name">Name</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="newest">Newest</option>
          <option value="rating">Rating</option>
        </select>
      </div>

      <div>
        <label className="mb-3 block text-sm font-medium">
          Price Range: {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()}
        </label>
        <Slider.Root
          className="relative flex h-5 w-full touch-none items-center"
          value={priceRange}
          onValueChange={(v) => setPriceRange(v as [number, number])}
          min={0}
          max={100000}
          step={500}
        >
          <Slider.Track className="relative h-1.5 grow rounded-full bg-border">
            <Slider.Range className="absolute h-full rounded-full bg-primary" />
          </Slider.Track>
          <Slider.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-surface shadow-md focus:outline-none focus:ring-2 focus:ring-primary" />
          <Slider.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-surface shadow-md focus:outline-none focus:ring-2 focus:ring-primary" />
        </Slider.Root>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isOnSale}
            onChange={(e) => setIsOnSale(e.target.checked)}
            className="rounded border-border text-primary focus:ring-primary"
          />
          On Sale
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isNew}
            onChange={(e) => setIsNew(e.target.checked)}
            className="rounded border-border text-primary focus:ring-primary"
          />
          New Arrivals
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="rounded border-border text-primary focus:ring-primary"
          />
          Featured
        </label>
      </div>

      <div className="flex gap-2">
        <Button onClick={applyFilters} className="flex-1">
          Apply Filters
        </Button>
        <Button variant="outline" onClick={clearFilters}>
          Clear
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-24 rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold">Filters</h2>
          {filterContent}
        </div>
      </aside>

      <div className="mb-4 lg:hidden">
        <Button
          variant="outline"
          onClick={() => setFilterDrawerOpen(true)}
          className="w-full"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </div>

      <AnimatePresence>
        {filterDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-foreground/40 lg:hidden"
              onClick={() => setFilterDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={cn(
                'fixed left-0 top-0 z-50 h-full w-80 overflow-y-auto bg-surface p-6 shadow-lg lg:hidden',
              )}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button
                  type="button"
                  onClick={() => setFilterDrawerOpen(false)}
                  className="rounded-lg p-1 hover:bg-border/50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {filterContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

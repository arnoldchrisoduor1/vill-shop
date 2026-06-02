'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Filter, RotateCcw, SlidersHorizontal, Star, X } from 'lucide-react';
import * as Slider from '@radix-ui/react-slider';
import { getCategories } from '@/lib/api/categories';
import type { Category } from '@/types/category';
import { DEBOUNCE_MS } from '@/lib/constants';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Toggle from '@/components/ui/Toggle';

interface ProductFilterProps {
  resultCount?: number;
}

const SORT_OPTIONS = [
  { value: '', label: 'Relevance' },
  { value: 'priceKes:asc', label: 'Price: Low to High' },
  { value: 'priceKes:desc', label: 'Price: High to Low' },
  { value: 'createdAt:desc', label: 'Newest First' },
  { value: 'averageRating:desc', label: 'Top Rated' },
];

function FilterContent({
  categories,
  onClose,
}: {
  categories: Category[];
  onClose?: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [category, setCategory] = useState(searchParams.get('category') ?? '');
  const [type, setType] = useState(searchParams.get('type') ?? '');
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get('minPrice') ?? 0),
    Number(searchParams.get('maxPrice') ?? 100000),
  ]);
  const [rating, setRating] = useState(Number(searchParams.get('rating') ?? 0));
  const [inStock, setInStock] = useState(searchParams.get('inStock') === 'true');
  const [sort, setSort] = useState(searchParams.get('sort') ?? '');

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildParams = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (type) params.set('type', type);
    if (priceRange[0] > 0) params.set('minPrice', String(priceRange[0]));
    if (priceRange[1] < 100000) params.set('maxPrice', String(priceRange[1]));
    if (rating > 0) params.set('rating', String(rating));
    if (inStock) params.set('inStock', 'true');
    if (sort) params.set('sort', sort);
    return params;
  }, [search, category, type, priceRange, rating, inStock, sort]);

  const applyFilters = useCallback(() => {
    const params = buildParams();
    router.push(`/products?${params.toString()}`);
    onClose?.();
  }, [buildParams, router, onClose]);

  // Debounced search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(applyFilters, DEBOUNCE_MS);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [search]);

  const activeCount = [
    category, type, priceRange[0] > 0 || priceRange[1] < 100000 ? 'price' : '', 
    rating > 0 ? 'rating' : '', inStock ? 'stock' : '', sort,
  ].filter(Boolean).length;

  const clearAll = () => {
    setSearch('');
    setCategory('');
    setType('');
    setPriceRange([0, 100000]);
    setRating(0);
    setInStock(false);
    setSort('');
    router.push('/products');
    onClose?.();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-[var(--color-primary)]" />
          <span className="text-sm font-semibold text-[var(--color-text)]">
            Filters
          </span>
          {activeCount > 0 && (
            <Badge variant="primary">{activeCount}</Badge>
          )}
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
          >
            <RotateCcw className="h-3 w-3" /> Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2 block">
          Search
        </label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
        />
      </div>

      {/* Category */}
      {categories.length > 0 && (
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2 block">
            Category
          </label>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => { setCategory(''); applyFilters(); }}
              className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors ${
                !category ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium' : 'text-[var(--color-text)] hover:bg-gray-50'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => { setCategory(cat.slug); applyFilters(); }}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors ${
                  category === cat.slug ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium' : 'text-[var(--color-text)] hover:bg-gray-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Type */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2 block">
          Product Type
        </label>
        <div className="flex gap-2">
          {[
            { value: '', label: 'All' },
            { value: 'physical', label: 'Physical' },
            { value: 'digital', label: 'Digital' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { setType(opt.value); applyFilters(); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                type === opt.value
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2 block">
          Price Range (KES)
        </label>
        <Slider.Root
          min={0}
          max={100000}
          step={500}
          value={priceRange}
          onValueChange={(v) => setPriceRange(v as [number, number])}
          onValueCommit={() => applyFilters()}
          className="relative flex items-center w-full h-5"
        >
          <Slider.Track className="relative h-1 grow rounded-full bg-gray-200">
            <Slider.Range className="absolute h-full rounded-full bg-[var(--color-primary)]" />
          </Slider.Track>
          {priceRange.map((_, i) => (
            <Slider.Thumb
              key={i}
              className="block h-4 w-4 rounded-full bg-[var(--color-primary)] shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 cursor-pointer"
            />
          ))}
        </Slider.Root>
        <div className="flex justify-between mt-2 text-xs text-[var(--color-text-muted)]">
          <span>KES {priceRange[0].toLocaleString()}</span>
          <span>KES {priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      {/* Rating */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2 block">
          Min Rating
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => { setRating(r === rating ? 0 : r); applyFilters(); }}
              className="p-0.5"
            >
              <Star
                className={`h-5 w-5 transition-colors ${
                  r <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 fill-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* In stock */}
      <Toggle
        checked={inStock}
        onChange={(v) => { setInStock(v); applyFilters(); }}
        label="In Stock Only"
      />

      {/* Sort */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2 block">
          Sort By
        </label>
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); applyFilters(); }}
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <Button onClick={applyFilters} variant="primary" className="w-full">
        Apply Filters
      </Button>
    </div>
  );
}

export default function ProductFilter({ resultCount }: ProductFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  return (
    <>
      {/* Mobile filter button */}
      <div className="lg:hidden flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileOpen(true)}
        >
          <Filter className="h-4 w-4" /> Filters
        </Button>
        {resultCount !== undefined && (
          <span className="text-sm text-[var(--color-text-muted)]">
            {resultCount} results
          </span>
        )}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-20 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          {resultCount !== undefined && (
            <p className="text-xs text-[var(--color-text-muted)] mb-4">
              {resultCount} results found
            </p>
          )}
          <FilterContent categories={categories} />
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute left-0 top-0 h-full w-80 bg-[var(--color-surface)] shadow-2xl overflow-y-auto"
            >
              <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
                <span className="font-semibold">Filters</span>
                <button onClick={() => setMobileOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-5">
                <FilterContent
                  categories={categories}
                  onClose={() => setMobileOpen(false)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

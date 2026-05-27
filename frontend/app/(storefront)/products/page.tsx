'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductFilter } from '@/components/products/ProductFilter';
import { ProductCardSkeleton } from '@/components/ui';
import { getProducts } from '@/lib/api/products';
import type { Product } from '@/types';
import type { ProductFilters } from '@/types/product';

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const filters: ProductFilters = {
          search: searchParams.get('search') ?? undefined,
          category: searchParams.get('category') ?? undefined,
          min_price: searchParams.get('min_price')
            ? Number(searchParams.get('min_price'))
            : undefined,
          max_price: searchParams.get('max_price')
            ? Number(searchParams.get('max_price'))
            : undefined,
          is_featured: searchParams.get('is_featured') === 'true' || undefined,
          sort: (searchParams.get('sort') as ProductFilters['sort']) ?? undefined,
          page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
          per_page: 12,
        };
        const result = await getProducts(filters);
        let filtered = result.data;
        if (searchParams.get('is_on_sale') === 'true') {
          filtered = filtered.filter((p) => p.is_on_sale);
        }
        if (searchParams.get('is_new') === 'true') {
          filtered = filtered.filter((p) => p.is_new);
        }
        setProducts(filtered);
        setTotal(searchParams.get('is_on_sale') || searchParams.get('is_new') ? filtered.length : result.meta.total);
      } catch {
        setProducts([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [searchParams]);

  return (
    <div className="container-page py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Shop</h1>
        <p className="mt-1 text-muted">
          {loading ? 'Loading...' : `${total} products found`}
        </p>
      </div>

      <div className="flex gap-8">
        <ProductFilter />
        <div className="flex-1">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : products.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
          </div>
          {!loading && products.length === 0 && (
            <div className="py-16 text-center text-muted">
              No products found. Try adjusting your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsContent />
    </Suspense>
  );
}

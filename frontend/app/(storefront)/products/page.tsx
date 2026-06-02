import { Suspense } from 'react';
import { productsApi } from '../../../lib/api/products';
import { categoriesApi } from '../../../lib/api/categories';
import { ProductsPriceFilter } from '../../../components/products/ProductsPriceFilter';
import { ProductsCatalog } from '../../../components/products/ProductsCatalog';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Products' };

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: {
    q?: string;
    category?: string;
    type?: string;
    sort?: string;
    cursor?: string;
    minPrice?: string;
    maxPrice?: string;
    view?: string;
  };
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;

  const [productsData, categories] = await Promise.allSettled([
    productsApi.getAll({
      q: params.q,
      category: params.category,
      type: params.type,
      sort: params.sort || 'newest',
      cursor: params.cursor,
      minPrice: params.minPrice ? Number(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
      limit: 20,
    }),
    categoriesApi.getAll(),
  ]);

  const products = productsData.status === 'fulfilled' ? (productsData.value?.items ?? []) : [];
  const cats = categories.status === 'fulfilled' ? categories.value : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-24 space-y-6">
            <h2 className="font-semibold text-lg">Filters</h2>
            <Suspense fallback={null}>
              <ProductsPriceFilter
                currentMin={params.minPrice}
                currentMax={params.maxPrice}
              />
            </Suspense>
            <div>
              <h3 className="text-sm font-medium mb-2">Product Type</h3>
              <div className="space-y-1">
                {[
                  { value: '', label: 'All' },
                  { value: 'physical', label: 'Physical' },
                  { value: 'digital', label: 'Digital' },
                ].map((t) => (
                  <a
                    key={t.value}
                    href={`/products?${new URLSearchParams({
                      ...params,
                      type: t.value,
                    } as Record<string, string>).toString()}`}
                    className={`block text-sm px-2 py-1 rounded hover:bg-[var(--color-background)] ${
                      (params.type || '') === t.value
                        ? 'text-[var(--color-primary)] font-medium'
                        : 'text-[var(--color-text-muted)]'
                    }`}
                  >
                    {t.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <ProductsCatalog
          products={products}
          categories={cats}
          params={{
            q: params.q,
            category: params.category,
            view: params.view,
          }}
        />
      </div>
    </div>
  );
}

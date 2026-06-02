'use client';

import { Suspense } from 'react';
import { ProductCard } from './ProductCard';
import { ProductListItem } from './ProductListItem';
import { ProductsToolbar } from './ProductsToolbar';
import type { Category, Product } from '../../types';

interface ProductsCatalogProps {
  products: Product[];
  categories: Category[];
  params: {
    q?: string;
    category?: string;
    view?: string;
  };
}

export function ProductsCatalog({ products, categories, params }: ProductsCatalogProps) {
  const view = params.view === 'list' ? 'list' : 'grid';

  return (
    <div className="flex-1">
      <Suspense fallback={null}>
        <ProductsToolbar
          categories={categories}
          currentCategory={params.category}
          currentQuery={params.q}
          currentView={params.view}
          productCount={products.length}
        />
      </Suspense>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[var(--color-text-muted)]">No products found. Try adjusting your filters.</p>
          <a href="/products" className="text-[var(--color-primary)] text-sm mt-2 block">
            Clear all filters
          </a>
        </div>
      ) : view === 'list' ? (
        <div className="space-y-3">
          {products.map((product) => (
            <ProductListItem key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

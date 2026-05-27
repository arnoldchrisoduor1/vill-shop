'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Tag, Sparkles } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductCardSkeleton } from '@/components/ui';
import type { Product } from '@/types';

interface SaleNewArrivalsProps {
  saleProducts: Product[];
  newProducts: Product[];
  loading?: boolean;
}

export function SaleNewArrivals({
  saleProducts,
  newProducts,
  loading,
}: SaleNewArrivalsProps) {
  return (
    <section className="py-16">
      <div className="container-page space-y-16">
        <div>
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-error/10">
              <Tag className="h-5 w-5 text-error" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">On Sale</h2>
              <p className="text-sm text-muted">Limited time offers</p>
            </div>
            <Link
              href="/products?is_on_sale=true"
              className="ml-auto hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : saleProducts.slice(0, 4).map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
          </div>
        </div>

        <div>
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
              <Sparkles className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">New Arrivals</h2>
              <p className="text-sm text-muted">Fresh picks just landed</p>
            </div>
            <Link
              href="/products?is_new=true"
              className="ml-auto hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : newProducts.slice(0, 4).map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
          </div>
        </div>
      </div>
    </section>
  );
}

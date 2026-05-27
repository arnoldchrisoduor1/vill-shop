'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { Card, CardContent } from '@/components/ui';
import { useWishlistStore } from '@/lib/store';

export default function AccountWishlistPage() {
  const items = useWishlistStore((s) => s.items);

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Heart className="mx-auto mb-4 h-12 w-12 text-muted" />
          <h2 className="text-lg font-semibold">Your wishlist is empty</h2>
          <p className="mt-2 text-muted">Save products you love for later</p>
          <Link href="/products" className="mt-4 inline-block text-primary hover:underline">
            Browse Products
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((product, i) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </div>
  );
}

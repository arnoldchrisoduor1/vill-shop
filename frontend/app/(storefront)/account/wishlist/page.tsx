'use client';

import { useEffect, useState } from 'react';
import { wishlistApi } from '../../../../lib/api/wishlist';
import { useWishlistStore } from '../../../../lib/store/wishlistStore';
import { ProductCard } from '../../../../components/products/ProductCard';
import { Skeleton } from '../../../../components/ui/Skeleton';
import { Heart } from 'lucide-react';
import type { Product } from '../../../../types';

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { setWishlist } = useWishlistStore();

  useEffect(() => {
    wishlistApi.getWishlist()
      .then((wishlist) => {
        setProducts(wishlist.products ?? []);
        setWishlist(wishlist.products?.map((p: Product) => p.id) ?? []);
      })
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false));
  }, [setWishlist]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1,2,3].map((i) => <Skeleton key={i} variant="card" />)}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-6">My Wishlist</h2>
      {products.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-[var(--color-border)] mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)]">Your wishlist is empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

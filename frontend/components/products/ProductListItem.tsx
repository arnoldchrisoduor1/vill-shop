'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Download, Star } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useCartStore } from '../../lib/store/cartStore';
import { useCartActions } from '../../lib/hooks/useCartActions';
import { formatPrice } from '../../lib/utils';
import { toast } from 'sonner';
import type { Product } from '../../types';

export function ProductListItem({ product }: { product: Product }) {
  const openCart = useCartStore((state) => state.openCart);
  const { addToCart } = useCartActions();
  const primaryImage = product.media?.find((m) => m.isPrimary) || product.media?.[0];
  const displayPrice = product.priceDisplay ?? product.priceKes;
  const currency = product.currency ?? 'KES';

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await addToCart(product);
      openCart();
      toast.success(`${product.name} added to cart`);
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Could not add to cart');
    }
  };

  return (
    <Link href={`/products/${product.slug}`}>
      <div className="group flex gap-4 bg-[var(--color-surface)] rounded-[var(--radius)] border border-[var(--color-border)] p-4 hover:border-[var(--color-primary)] transition-colors">
        <div className="relative h-24 w-24 shrink-0 rounded-[var(--radius)] overflow-hidden bg-[var(--color-background)]">
          {primaryImage ? (
            <Image src={primaryImage.url} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <ShoppingCart className="h-8 w-8 text-[var(--color-border)]" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-medium truncate">{product.name}</h3>
                {product.isFeatured && <Badge variant="primary">Featured</Badge>}
                {product.type === 'digital' && <Badge variant="secondary">Digital</Badge>}
              </div>
              {product.category && (
                <p className="text-xs text-[var(--color-text-muted)] mb-1">{product.category.name}</p>
              )}
              <p className="text-sm text-[var(--color-text-muted)] line-clamp-2">{product.description}</p>
              {product.averageRating != null && (
                <div className="flex items-center gap-1 mt-2">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {product.averageRating.toFixed(1)} ({product.reviewCount ?? 0})
                  </span>
                </div>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-[var(--color-primary)] mb-2">
                {formatPrice(Number(displayPrice), currency)}
              </p>
              <Button
                size="sm"
                onClick={handleAddToCart}
                disabled={product.stock === 0 && product.type === 'physical'}
              >
                {product.type === 'digital' ? (
                  <><Download className="h-3 w-3" /> Buy</>
                ) : product.stock === 0 ? (
                  'Out of Stock'
                ) : (
                  <><ShoppingCart className="h-3 w-3" /> Add</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

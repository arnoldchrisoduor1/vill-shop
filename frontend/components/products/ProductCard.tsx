'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, Star, ShoppingCart, Download } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useCartStore } from '../../lib/store/cartStore';
import { useCartActions } from '../../lib/hooks/useCartActions';
import { useWishlistActions, useIsInWishlist } from '../../lib/hooks/useWishlistActions';
import { formatPrice } from '../../lib/utils';
import { resolveMediaUrl } from '../../lib/media';
import { toast } from 'sonner';
import type { Product } from '../../types';

export function ProductCard({ product }: { product: Product }) {
  const openCart = useCartStore((state) => state.openCart);
  const { addToCart } = useCartActions();
  const { toggleWishlist } = useWishlistActions();
  const isWished = useIsInWishlist(product.id);
  const primaryImage = product.media?.find((m) => m.isPrimary) || product.media?.[0];
  const imageUrl = primaryImage ? resolveMediaUrl(primaryImage.url) : undefined;
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

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    await toggleWishlist(product.id);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <Link href={`/products/${product.slug}`}>
        <div className="group bg-[var(--color-surface)] rounded-[var(--radius)] border border-[var(--color-border)] overflow-hidden hover:shadow-lg transition-shadow">
          {/* Image */}
          <div className="relative h-48 bg-[var(--color-background)]">
            {imageUrl ? (
              <Image src={imageUrl} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized={imageUrl.startsWith('http://')} />
            ) : (
              <div className="h-full flex items-center justify-center">
                <ShoppingCart className="h-12 w-12 text-[var(--color-border)]" />
              </div>
            )}
            {/* Badges */}
            <div className="absolute top-2 left-2 flex gap-1">
              {product.isFeatured && <Badge variant="primary">Featured</Badge>}
              {product.type === 'digital' && <Badge variant="secondary">Digital</Badge>}
            </div>
            {/* Wishlist button */}
            <button
              onClick={handleWishlist}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors backdrop-blur-sm"
            >
              <Heart className={`h-4 w-4 ${isWished ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-medium text-sm line-clamp-2 mb-1">{product.name}</h3>
            {product.averageRating != null && (
              <div className="flex items-center gap-1 mb-2">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-[var(--color-text-muted)]">
                  {product.averageRating.toFixed(1)} ({product.reviewCount ?? 0})
                </span>
              </div>
            )}
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-[var(--color-primary)]">
                {formatPrice(Number(displayPrice), currency)}
              </span>
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
      </Link>
    </motion.div>
  );
}

export default ProductCard;

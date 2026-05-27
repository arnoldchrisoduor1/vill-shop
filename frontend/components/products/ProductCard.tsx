'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { useCart } from '@/context';
import { useWishlistStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleItem, hasItem } = useWishlistStore();
  const image = product.images?.find((i) => i.is_primary) ?? product.images?.[0];
  const isWishlisted = hasItem(product.id);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group overflow-hidden rounded-xl border border-border bg-surface shadow-sm"
    >
      <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-border/30">
        {image?.url ? (
          <Image
            src={image.url}
            alt={image.alt ?? product.name}
            fill
            className="object-cover group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            No image
          </div>
        )}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.is_on_sale && <Badge variant="error">Sale</Badge>}
          {product.is_new && <Badge variant="secondary">New</Badge>}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleItem(product);
          }}
          className="absolute right-2 top-2 rounded-full bg-white/90 p-2 shadow-sm hover:bg-white"
        >
          <Heart
            className={`h-4 w-4 ${isWishlisted ? 'fill-error text-error' : 'text-muted'}`}
          />
        </button>
      </Link>

      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="truncate font-medium hover:text-primary">{product.name}</h3>
        </Link>

        {product.average_rating !== undefined && product.average_rating > 0 && (
          <div className="mt-1 flex items-center gap-1">
            <Star className="h-3 w-3 fill-warning text-warning" />
            <span className="text-xs text-muted">
              {product.average_rating.toFixed(1)}
              {product.review_count ? ` (${product.review_count})` : ''}
            </span>
          </div>
        )}

        <div className="mt-2 flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(product.price)}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="ml-2 text-sm text-muted line-through">
                {formatCurrency(product.compare_at_price)}
              </span>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => addToCart(product)}
            disabled={product.stock <= 0}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

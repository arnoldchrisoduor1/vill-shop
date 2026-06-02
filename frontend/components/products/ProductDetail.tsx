'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ShoppingCart, Heart, Star, Download, Package } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ReviewForm } from './ReviewForm';
import { useCartStore } from '../../lib/store/cartStore';
import { useCartActions } from '../../lib/hooks/useCartActions';
import { useWishlistActions, useIsInWishlist } from '../../lib/hooks/useWishlistActions';
import { useAuth } from '../../context/AuthContext';
import { formatPrice, formatDate } from '../../lib/utils';
import { reviewsApi } from '../../lib/api/reviews';
import { toast } from 'sonner';
import type { Product, ProductVariant } from '../../types';

export function ProductDetail({ product }: { product: Product }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [canReview, setCanReview] = useState(false);
  const openCart = useCartStore((state) => state.openCart);
  const { addToCart } = useCartActions();
  const { toggleWishlist } = useWishlistActions();
  const { user } = useAuth();
  const isWished = useIsInWishlist(product.id);

  const images = product.media?.sort((a, b) => (a.isPrimary ? -1 : 1) - (b.isPrimary ? -1 : 1)) ?? [];
  const price = selectedVariant?.priceKes ?? product.priceKes;
  const displayPrice = product.priceDisplay ?? price;
  const currency = product.currency ?? 'KES';
  const stock = selectedVariant?.stock ?? product.stock;
  const averageRating = product.averageRating ?? 0;
  const reviews = (product as Product & { reviews?: Array<{ id: string; user: { name: string }; rating: number; comment?: string; createdAt: string }> }).reviews ?? [];

  useEffect(() => {
    if (!user) {
      setCanReview(false);
      return;
    }
    reviewsApi.canReview(product.id).then((res) => setCanReview(res.canReview)).catch(() => setCanReview(false));
  }, [user, product.id]);

  const handleAddToCart = async () => {
    try {
      await addToCart(product, quantity, selectedVariant ?? undefined);
      openCart();
      toast.success(`${product.name} added to cart`);
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Could not add to cart');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="relative aspect-square rounded-[var(--radius)] overflow-hidden bg-[var(--color-background)] mb-4">
            {images[selectedImage] ? (
              <Image src={images[selectedImage].url} alt={product.name} fill className="object-cover" priority />
            ) : (
              <div className="h-full flex items-center justify-center">
                <Package className="h-24 w-24 text-[var(--color-border)]" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button key={img.id} onClick={() => setSelectedImage(i)}
                  className={`relative h-16 w-16 shrink-0 rounded overflow-hidden border-2 transition-colors ${i === selectedImage ? 'border-[var(--color-primary)]' : 'border-transparent'}`}>
                  <Image src={img.url} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.category && <Badge variant="outline">{product.category.name}</Badge>}
                {product.type === 'digital' && <Badge variant="secondary">Digital</Badge>}
              </div>
              <h1 className="text-3xl font-bold text-[var(--color-text)]">{product.name}</h1>
            </div>
            <button onClick={() => toggleWishlist(product.id)}
              className="p-2 rounded-full border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors">
              <Heart className={`h-5 w-5 ${isWished ? 'fill-red-500 text-red-500' : 'text-[var(--color-text-muted)]'}`} />
            </button>
          </div>

          {averageRating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`h-4 w-4 ${star <= Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-sm text-[var(--color-text-muted)]">
                {averageRating.toFixed(1)} ({product.reviewCount ?? reviews.length} reviews)
              </span>
            </div>
          )}

          <div className="text-3xl font-bold text-[var(--color-primary)] mb-6">
            {formatPrice(Number(displayPrice), currency)}
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Variant</label>
              <div className="flex flex-wrap gap-2">
                {product.variants.filter(v => v.isActive).map((variant) => (
                  <button key={variant.id}
                    onClick={() => setSelectedVariant(selectedVariant?.id === variant.id ? null : variant)}
                    className={`px-3 py-1.5 rounded-[var(--radius)] border text-sm transition-colors ${selectedVariant?.id === variant.id ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'}`}>
                    {variant.name} — {formatPrice(Number(variant.priceKes), 'KES')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + Add to cart */}
          {product.type === 'physical' && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded border border-[var(--color-border)] flex items-center justify-center hover:border-[var(--color-primary)]">
                  −
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                  className="w-8 h-8 rounded border border-[var(--color-border)] flex items-center justify-center hover:border-[var(--color-primary)]">
                  +
                </button>
              </div>
              <span className="text-sm text-[var(--color-text-muted)]">{stock} in stock</span>
            </div>
          )}

          <div className="flex gap-3 mb-8">
            <Button onClick={handleAddToCart} size="lg" className="flex-1" disabled={product.type === 'physical' && stock === 0}>
              {product.type === 'digital' ? (
                <><Download className="h-5 w-5" /> Buy Digital</>
              ) : stock === 0 ? (
                'Out of Stock'
              ) : (
                <><ShoppingCart className="h-5 w-5" /> Add to Cart</>
              )}
            </Button>
          </div>

          {/* Description */}
          <div className="prose prose-sm max-w-none">
            <h3 className="font-semibold text-lg mb-2">Description</h3>
            <p className="text-[var(--color-text-muted)] leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-8">Reviews</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {reviews.length === 0 ? (
              <p className="text-[var(--color-text-muted)]">No reviews yet. Be the first!</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="border border-[var(--color-border)] rounded-[var(--radius)] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{review.user.name}</span>
                    <div className="flex">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className={`h-4 w-4 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="text-sm text-[var(--color-text-muted)]">{review.comment}</p>}
                  <p className="text-xs text-[var(--color-text-muted)] mt-2">{formatDate(review.createdAt)}</p>
                </div>
              ))
            )}
          </div>
          {user && canReview ? (
            <div>
              <h3 className="font-semibold mb-4">Write a Review</h3>
              <ReviewForm productId={product.id} />
            </div>
          ) : user ? (
            <p className="text-sm text-[var(--color-text-muted)]">
              Reviews are available after your order is delivered.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Minus, Plus, ShoppingCart, Star, Heart } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { ReviewForm } from '@/components/products/ReviewForm';
import { useCart } from '@/context';
import { useWishlistStore } from '@/lib/store';
import { getProduct } from '@/lib/api/products';
import { getProductReviews } from '@/lib/api/reviews';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';
import type { Review } from '@/types';

interface ProductDetailProps {
  slug: string;
}

export function ProductDetail({ slug }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toggleItem, hasItem } = useWishlistStore();

  const loadReviews = async (productId: number) => {
    try {
      const data = await getProductReviews(productId);
      setReviews(data);
    } catch {
      setReviews([]);
    }
  };

  useEffect(() => {
    async function load() {
      try {
        const data = await getProduct(slug);
        setProduct(data);
        await loadReviews(data.id);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="container-page py-16 text-center text-muted">
        Loading product...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [];
  const isWishlisted = hasItem(product.id);

  return (
    <div className="container-page py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-xl bg-border/30">
            {images[selectedImage]?.url ? (
              <Image
                src={images[selectedImage].url}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted">
                No image
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-4 flex gap-2">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedImage(i)}
                  className={`relative h-20 w-20 overflow-hidden rounded-lg border-2 ${
                    i === selectedImage ? 'border-primary' : 'border-border'
                  }`}
                >
                  <Image src={img.url} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="mb-2 flex gap-2">
            {product.is_on_sale && <Badge variant="error">Sale</Badge>}
            {product.is_new && <Badge variant="secondary">New</Badge>}
            {product.is_featured && <Badge variant="primary">Featured</Badge>}
          </div>

          <h1 className="text-3xl font-bold">{product.name}</h1>

          {product.average_rating !== undefined && product.average_rating > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(product.average_rating!)
                        ? 'fill-warning text-warning'
                        : 'text-border'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted">
                {product.average_rating.toFixed(1)} ({product.review_count} reviews)
              </span>
            </div>
          )}

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">
              {formatCurrency(product.price)}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-lg text-muted line-through">
                {formatCurrency(product.compare_at_price)}
              </span>
            )}
          </div>

          <p className="mt-4 text-muted">{product.description}</p>

          <p className="mt-2 text-sm">
            {product.stock > 0 ? (
              <span className="text-secondary">In stock ({product.stock} available)</span>
            ) : (
              <span className="text-error">Out of stock</span>
            )}
          </p>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 hover:bg-border/50"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="p-2 hover:bg-border/50"
                disabled={quantity >= product.stock}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <Button
              size="lg"
              onClick={() => addToCart(product, quantity)}
              disabled={product.stock <= 0}
            >
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => toggleItem(product)}
            >
              <Heart
                className={`h-5 w-5 ${isWishlisted ? 'fill-error text-error' : ''}`}
              />
            </Button>
          </div>
        </motion.div>
      </div>

      <div className="mt-16 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-xl font-semibold">Customer Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-muted">No reviews yet. Be the first!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-lg border border-border p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium">{review.user?.name ?? 'Anonymous'}</span>
                    <div className="flex">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-warning text-warning" />
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="text-sm text-muted">{review.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
        <ReviewForm
          productId={product.id}
          onSuccess={() => loadReviews(product.id)}
        />
      </div>
    </div>
  );
}

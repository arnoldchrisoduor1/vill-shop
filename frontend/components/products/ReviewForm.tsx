'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Textarea } from '@/components/ui';
import { useAuth } from '@/context';
import { createReview } from '@/lib/api/reviews';
import { reviewSchema, type ReviewFormData } from '@/validators';
import { ApiFetchError } from '@/lib/api';

interface ReviewFormProps {
  productId: number;
  onSuccess?: () => void;
}

export function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const { isAuthenticated } = useAuth();
  const [hoverRating, setHoverRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: '' },
  });

  const rating = watch('rating');

  if (!isAuthenticated) {
    return (
      <p className="text-sm text-muted">
        Please <a href="/login" className="text-primary hover:underline">sign in</a> to leave a review.
      </p>
    );
  }

  const onSubmit = async (data: ReviewFormData) => {
    setIsLoading(true);
    try {
      await createReview(productId, data);
      toast.success('Review submitted!');
      reset();
      onSuccess?.();
    } catch (err) {
      const message =
        err instanceof ApiFetchError ? err.message : 'Failed to submit review';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-xl border border-border bg-surface p-6"
    >
      <h3 className="font-semibold">Write a Review</h3>

      <div>
        <label className="mb-2 block text-sm font-medium">Rating</label>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const value = i + 1;
            return (
              <button
                key={i}
                type="button"
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setValue('rating', value, { shouldValidate: true })}
              >
                <Star
                  className={`h-6 w-6 ${
                    value <= (hoverRating || rating)
                      ? 'fill-warning text-warning'
                      : 'text-border'
                  }`}
                />
              </button>
            );
          })}
        </div>
        {errors.rating && (
          <p className="mt-1 text-xs text-error">{errors.rating.message}</p>
        )}
      </div>

      <Textarea
        label="Review"
        placeholder="Share your experience..."
        error={errors.comment?.message}
        {...register('comment')}
      />

      <Button type="submit" isLoading={isLoading}>
        Submit Review
      </Button>
    </motion.form>
  );
}

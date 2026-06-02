'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Star } from 'lucide-react';
import { reviewsApi } from '../../lib/api/reviews';
import { reviewSchema, type ReviewFormData } from '../../validators/review';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { toast } from 'sonner';

export function ReviewForm({ productId }: { productId: string }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
  });

  const onSubmit = async (data: ReviewFormData) => {
    if (rating === 0) { toast.error('Please select a rating'); return; }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('rating', String(rating));
      if (data.comment) formData.append('comment', data.comment);
      if (image) formData.append('image', image);
      await reviewsApi.createReview(productId, formData);
      toast.success('Review submitted!');
      reset();
      setRating(0);
      setImage(null);
      window.location.reload();
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to submit review');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="focus:outline-none">
              <Star className={`h-7 w-7 transition-colors ${star <= (hovered || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
            </button>
          ))}
        </div>
      </div>
      <Textarea
        label="Comment (optional)"
        placeholder="Share your experience..."
        {...register('comment')}
        error={errors.comment?.message}
      />
      <div>
        <label className="text-sm font-medium mb-2 block">Photo (optional)</label>
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
      </div>
      <Button type="submit" isLoading={isLoading} className="w-full">Submit Review</Button>
    </form>
  );
}

import { z } from 'zod';

export const reviewSchema = z.object({
  rating: z.number().min(1, 'Rating is required').max(5),
  comment: z.string().min(10, 'Review must be at least 10 characters').max(2000),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;

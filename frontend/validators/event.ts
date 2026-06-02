import { z } from 'zod';

export const eventSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  slug: z.string().optional(),
  description: z.string().min(10, 'Description required'),
  startsAt: z.string().min(1, 'Start date required'),
  endsAt: z.string().min(1, 'End date required'),
  location: z.string().optional(),
  coverImageUrl: z.string().optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export type EventFormData = z.infer<typeof eventSchema>;

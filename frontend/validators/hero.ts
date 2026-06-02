import { z } from 'zod';

export const heroSlideSchema = z.object({
  headline: z.string().min(2, 'Headline is required'),
  subtext: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  sortOrder: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type HeroSlideFormData = z.infer<typeof heroSlideSchema>;

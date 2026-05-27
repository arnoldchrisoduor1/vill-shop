import { z } from 'zod';

export const heroSlideSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  subtitle: z.string().optional(),
  cta_text: z.string().optional(),
  cta_url: z.string().optional(),
  image_url: z.string().url('Valid image URL required'),
  sort_order: z.coerce.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

export type HeroSlideFormData = z.infer<typeof heroSlideSchema>;

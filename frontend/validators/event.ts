import { z } from 'zod';

export const eventSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().min(10, 'Description is required'),
  location: z.string().min(2, 'Location is required'),
  starts_at: z.string().min(1, 'Start date is required'),
  ends_at: z.string().min(1, 'End date is required'),
  max_attendees: z.coerce.number().int().positive().optional(),
  is_active: z.boolean().default(true),
});

export type EventFormData = z.infer<typeof eventSchema>;

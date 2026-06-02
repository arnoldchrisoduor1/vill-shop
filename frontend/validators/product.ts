import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.enum(['physical', 'digital']),
  sku: z.string().min(1, 'SKU is required'),
  stock: z.number().min(0, 'Stock cannot be negative'),
  priceKes: z.number().positive('Price must be positive'),
  categoryId: z.union([z.string().uuid(), z.literal('')]).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;

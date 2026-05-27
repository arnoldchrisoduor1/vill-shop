import { z } from 'zod';
import { PRODUCT_CATEGORIES } from '@/lib/constants';

export const productSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().min(10, 'Description is required'),
  short_description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be positive'),
  compare_at_price: z.coerce.number().optional(),
  sku: z.string().min(1, 'SKU is required'),
  stock: z.coerce.number().int().min(0, 'Stock must be non-negative'),
  category: z.enum(PRODUCT_CATEGORIES),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
  is_new: z.boolean().default(false),
  is_on_sale: z.boolean().default(false),
});

export type ProductFormData = z.infer<typeof productSchema>;

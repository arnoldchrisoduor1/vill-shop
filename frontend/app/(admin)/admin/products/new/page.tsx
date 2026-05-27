'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button, Input, Textarea, Toggle, Card, CardContent } from '@/components/ui';
import { createProduct } from '@/lib/api/products';
import { productSchema, type ProductFormData } from '@/validators';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { ApiFetchError } from '@/lib/api';

export default function NewProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      is_featured: false,
      is_active: true,
      is_new: false,
      is_on_sale: false,
      category: 'other',
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    try {
      await createProduct(data);
      toast.success('Product created');
      router.push('/admin/products');
    } catch (err) {
      toast.error(err instanceof ApiFetchError ? err.message : 'Failed to create product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">New Product</h1>
      <Card className="max-w-2xl">
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Name" error={errors.name?.message} {...register('name')} />
            <Textarea label="Description" error={errors.description?.message} {...register('description')} />
            <Input label="Short Description" error={errors.short_description?.message} {...register('short_description')} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Price" type="number" step="0.01" error={errors.price?.message} {...register('price')} />
              <Input label="Compare At Price" type="number" step="0.01" error={errors.compare_at_price?.message} {...register('compare_at_price')} />
              <Input label="SKU" error={errors.sku?.message} {...register('sku')} />
              <Input label="Stock" type="number" error={errors.stock?.message} {...register('stock')} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Category</label>
              <select
                {...register('category')}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              >
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-4">
              <Toggle label="Active" checked={watch('is_active')} onChange={(v) => setValue('is_active', v)} />
              <Toggle label="Featured" checked={watch('is_featured')} onChange={(v) => setValue('is_featured', v)} />
              <Toggle label="New" checked={watch('is_new')} onChange={(v) => setValue('is_new', v)} />
              <Toggle label="On Sale" checked={watch('is_on_sale')} onChange={(v) => setValue('is_on_sale', v)} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" isLoading={isLoading}>Create Product</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

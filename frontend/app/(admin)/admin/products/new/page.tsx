'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, type ProductFormData } from '../../../../../validators/product';
import { productsApi } from '../../../../../lib/api/products';
import { categoriesApi } from '../../../../../lib/api/categories';
import { Button } from '../../../../../components/ui/Button';
import { Input } from '../../../../../components/ui/Input';
import { Textarea } from '../../../../../components/ui/Textarea';
import { Toggle } from '../../../../../components/ui/Toggle';
import { Dropdown } from '../../../../../components/ui/Dropdown';
import { ImageUploadPreview } from '../../../../../components/ui/ImageUploadPreview';
import { useFeature } from '../../../../../context/FeatureContext';
import { toast } from 'sonner';
import type { Category } from '../../../../../types';

export default function NewProductPage() {
  const router = useRouter();
  const digitalEnabled = useFeature('digital_products');
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<FileList | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { type: 'physical', isActive: true, isFeatured: false, stock: 0 },
  });

  useEffect(() => {
    categoriesApi.getAll().then(setCategories).catch(() => {});
  }, []);

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      const payload = {
        ...data,
        categoryId: data.categoryId || undefined,
      };
      Object.entries(payload).forEach(([key, val]) => {
        if (val !== undefined && val !== null) formData.append(key, String(val));
      });
      if (images) {
        Array.from(images).forEach((file) => formData.append('images', file));
      }
      await productsApi.create(formData);
      toast.success('Product created!');
      router.push('/admin/products');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to create product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">New Product</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Product Name" {...register('name')} error={errors.name?.message} className="col-span-2" />
          <Input label="SKU" {...register('sku')} error={errors.sku?.message} />
          <Input label="Price (KES)" type="number" step="0.01" {...register('priceKes', { valueAsNumber: true })} error={errors.priceKes?.message} />
          <Input label="Stock" type="number" {...register('stock', { valueAsNumber: true })} error={errors.stock?.message} />
          <Dropdown
            label="Type"
            options={[
              { value: 'physical', label: 'Physical' },
              ...(digitalEnabled ? [{ value: 'digital', label: 'Digital' }] : []),
            ]}
            value={watch('type')}
            onChange={(val) => setValue('type', val as 'physical' | 'digital')}
          />
        </div>
        <Textarea label="Description" {...register('description')} error={errors.description?.message} rows={5} />
        <Dropdown
          label="Category"
          options={[{ value: '', label: 'No Category' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
          value={watch('categoryId') || ''}
          onChange={(val) => setValue('categoryId', val || undefined)}
        />
        <div className="flex gap-6">
          <Toggle label="Active" checked={watch('isActive') ?? true} onChange={(v) => setValue('isActive', v)} />
          <Toggle label="Featured" checked={watch('isFeatured') ?? false} onChange={(v) => setValue('isFeatured', v)} />
        </div>
        <ImageUploadPreview label="Product Images" files={images} onChange={setImages} />
        <div className="flex gap-3">
          <Button type="submit" isLoading={isLoading}>Create Product</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}

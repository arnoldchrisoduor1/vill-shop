'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button, Input, Textarea, Toggle, Card, CardContent } from '@/components/ui';
import { getAdminProducts, updateProduct } from '@/lib/api/products';
import { productSchema, type ProductFormData } from '@/validators';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { ApiFetchError } from '@/lib/api';

interface EditProductPageProps {
  params: { id: string };
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    getAdminProducts()
      .then((r) => {
        const product = r.data.find((p) => p.id === Number(params.id));
        if (product) {
          reset({
            name: product.name,
            description: product.description,
            short_description: product.short_description,
            price: product.price,
            compare_at_price: product.compare_at_price,
            sku: product.sku,
            stock: product.stock,
            category: product.category as ProductFormData['category'],
            is_featured: product.is_featured,
            is_active: product.is_active,
            is_new: product.is_new,
            is_on_sale: product.is_on_sale,
          });
        }
      })
      .finally(() => setLoadingProduct(false));
  }, [params.id, reset]);

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    try {
      await updateProduct(Number(params.id), data);
      toast.success('Product updated');
      router.push('/admin/products');
    } catch (err) {
      toast.error(err instanceof ApiFetchError ? err.message : 'Failed to update product');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingProduct) return <p className="text-muted">Loading...</p>;

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">Edit Product</h1>
      <Card className="max-w-2xl">
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Name" error={errors.name?.message} {...register('name')} />
            <Textarea label="Description" error={errors.description?.message} {...register('description')} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Price" type="number" step="0.01" error={errors.price?.message} {...register('price')} />
              <Input label="Stock" type="number" error={errors.stock?.message} {...register('stock')} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Category</label>
              <select {...register('category')} className="w-full rounded-lg border border-border px-3 py-2 text-sm">
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-4">
              <Toggle label="Active" checked={watch('is_active')} onChange={(v) => setValue('is_active', v)} />
              <Toggle label="Featured" checked={watch('is_featured')} onChange={(v) => setValue('is_featured', v)} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" isLoading={isLoading}>Save Changes</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

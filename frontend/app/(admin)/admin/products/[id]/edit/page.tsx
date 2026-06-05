'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productsApi } from '../../../../../../lib/api/products';
import { Input } from '../../../../../../components/ui/Input';
import { Textarea } from '../../../../../../components/ui/Textarea';
import { Trash2 } from 'lucide-react';
import { Button } from '../../../../../../components/ui/Button';
import { ImageUploadPreview } from '../../../../../../components/ui/ImageUploadPreview';
import { toast } from 'sonner';
import type { Product } from '../../../../../../types';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [images, setImages] = useState<FileList | null>(null);

  useEffect(() => {
    if (!id) return;
    productsApi.getById(id).then(setProduct).catch(() => toast.error('Product not found'));
  }, [id]);

  const handleDelete = async () => {
    if (!product || !id) return;
    if (!confirm(`Delete product "${product.name}"? This cannot be undone.`)) return;
    setIsDeleting(true);
    try {
      await productsApi.delete(id);
      toast.success('Product deleted');
      router.push('/admin/products');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!product || !id) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('description', product.description);
      formData.append('priceKes', String(product.priceKes));
      formData.append('stock', String(product.stock));
      if (images) {
        Array.from(images).forEach((file) => formData.append('images', file));
      }
      await productsApi.update(id, formData);
      toast.success('Product updated!');
      router.push('/admin/products');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!product) return <div className="animate-pulse h-64 bg-[var(--color-border)] rounded" />;

  const existingImages = product.media?.map((m) => m.url) ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Edit Product</h1>
      <form onSubmit={handleSave} className="max-w-2xl space-y-4">
        <Input label="Name" value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} />
        <Textarea label="Description" value={product.description} onChange={(e) => setProduct({ ...product, description: e.target.value })} rows={5} />
        <Input label="Price (KES)" type="number" step="0.01" value={product.priceKes} onChange={(e) => setProduct({ ...product, priceKes: Number(e.target.value) })} />
        <Input label="Stock" type="number" value={product.stock} onChange={(e) => setProduct({ ...product, stock: Number(e.target.value) })} />
        <ImageUploadPreview
          label="Add more images"
          files={images}
          existingUrls={existingImages}
          onChange={setImages}
        />
        <div className="flex flex-wrap gap-3">
          <Button type="submit" isLoading={isLoading}>Save Changes</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button
            type="button"
            variant="danger"
            isLoading={isDeleting}
            onClick={handleDelete}
            className="ml-auto"
          >
            <Trash2 className="h-4 w-4" /> Delete Product
          </Button>
        </div>
      </form>
    </div>
  );
}

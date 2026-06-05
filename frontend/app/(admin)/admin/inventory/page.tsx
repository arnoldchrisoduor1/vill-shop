'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { apiFetch } from '../../../../lib/api/apiFetch';
import { productsApi } from '../../../../lib/api/products';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Badge } from '../../../../components/ui/Badge';
import { Skeleton } from '../../../../components/ui/Skeleton';
import { toast } from 'sonner';
import type { Product } from '../../../../types';

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updates, setUpdates] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ items: Product[] }>('/api/v1/admin/inventory')
      .then((res) => setProducts(res.data.items ?? []))
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false));
  }, []);

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete product "${product.name}"? This cannot be undone.`)) return;
    setDeletingId(product.id);
    try {
      await productsApi.delete(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      setUpdates((prev) => {
        const next = { ...prev };
        delete next[product.id];
        return next;
      });
      toast.success('Product deleted');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSave = async () => {
    if (Object.keys(updates).length === 0) return;
    setIsSaving(true);
    try {
      await apiFetch('/api/v1/admin/inventory/bulk', {
        method: 'PATCH',
        body: JSON.stringify({ updates: Object.entries(updates).map(([id, stock]) => ({ id, stock })) }),
      });
      toast.success('Stock updated!');
      setUpdates({});
      // Refresh
      const res = await apiFetch<{ items: Product[] }>('/api/v1/admin/inventory');
      setProducts(res.data.items ?? []);
    } catch {
      toast.error('Failed to update stock');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12" />)}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Inventory</h1>
        {Object.keys(updates).length > 0 && (
          <Button onClick={handleSave} isLoading={isSaving}>Save {Object.keys(updates).length} changes</Button>
        )}
      </div>
      <div className="bg-[var(--color-surface)] rounded-[var(--radius)] border border-[var(--color-border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-background)] border-b border-[var(--color-border)]">
            <tr>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left">SKU</th>
              <th className="px-4 py-3 text-left">Current Stock</th>
              <th className="px-4 py-3 text-left">Update Stock</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-background)]">
                <td className="px-4 py-3 font-medium">{product.name}</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">{product.sku}</td>
                <td className="px-4 py-3">
                  <Badge variant={product.stock === 0 ? 'danger' : product.stock < 5 ? 'warning' : 'success'}>
                    {product.stock} units
                  </Badge>
                </td>
                <td className="px-4 py-3 w-32">
                  <Input
                    type="number"
                    min="0"
                    defaultValue={product.stock}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val !== product.stock) {
                        setUpdates((prev) => ({ ...prev, [product.id]: val }));
                      } else {
                        setUpdates((prev) => { const next = { ...prev }; delete next[product.id]; return next; });
                      }
                    }}
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <Button
                    size="sm"
                    variant="danger"
                    aria-label="Delete product"
                    isLoading={deletingId === product.id}
                    onClick={() => handleDelete(product)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="text-center py-8 text-[var(--color-text-muted)]">No products.</p>}
      </div>
    </div>
  );
}

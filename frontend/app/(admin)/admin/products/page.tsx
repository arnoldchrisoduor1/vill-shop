'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutGrid, List, Plus, Edit, Search, Trash2 } from 'lucide-react';
import { productsApi } from '../../../../lib/api/products';
import { categoriesApi } from '../../../../lib/api/categories';
import { Toggle } from '../../../../components/ui/Toggle';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Input } from '../../../../components/ui/Input';
import { Skeleton } from '../../../../components/ui/Skeleton';
import { formatPrice } from '../../../../lib/utils';
import { toast } from 'sonner';
import type { Category, Product } from '../../../../types';

type ViewMode = 'grid' | 'list';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [view, setView] = useState<ViewMode>('list');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const loadProducts = useCallback(() => {
    setIsLoading(true);
    productsApi
      .adminGetAll({
        limit: 100,
        q: debouncedSearch || undefined,
        category: categorySlug || undefined,
      })
      .then((data) => setProducts(data.items ?? []))
      .catch(() => {
        setProducts([]);
        toast.error('Failed to load products');
      })
      .finally(() => setIsLoading(false));
  }, [debouncedSearch, categorySlug]);

  useEffect(() => {
    categoriesApi.getAll().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleToggleFeatured = async (product: Product) => {
    try {
      await productsApi.toggleFeatured(product.id);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isFeatured: !p.isFeatured } : p)),
      );
      toast.success('Updated');
    } catch {
      toast.error('Failed');
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await productsApi.toggleActive(product.id);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isActive: !p.isActive } : p)),
      );
      toast.success('Updated');
    } catch {
      toast.error('Failed');
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete product "${product.name}"? This cannot be undone.`)) return;
    setDeletingId(product.id);
    try {
      await productsApi.delete(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      toast.success('Product deleted');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  const renderList = () => (
    <div className="bg-[var(--color-surface)] rounded-[var(--radius)] border border-[var(--color-border)] overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-[var(--color-background)] border-b border-[var(--color-border)]">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Product</th>
            <th className="px-4 py-3 text-left font-medium">SKU</th>
            <th className="px-4 py-3 text-left font-medium">Price</th>
            <th className="px-4 py-3 text-left font-medium">Stock</th>
            <th className="px-4 py-3 text-center font-medium">Featured</th>
            <th className="px-4 py-3 text-center font-medium">Active</th>
            <th className="px-4 py-3 text-center font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const primaryImage = product.media?.find((m) => m.isPrimary) || product.media?.[0];
            return (
              <tr key={product.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-background)]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded overflow-hidden bg-[var(--color-background)] shrink-0">
                      {primaryImage ? (
                        <Image src={primaryImage.url} alt={product.name} fill className="object-cover" />
                      ) : null}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.category && (
                          <Badge variant="outline" className="text-[10px]">{product.category.name}</Badge>
                        )}
                        <Badge variant={product.type === 'digital' ? 'secondary' : 'outline'} className="text-[10px]">
                          {product.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">{product.sku}</td>
                <td className="px-4 py-3 font-medium">{formatPrice(Number(product.priceKes))}</td>
                <td className="px-4 py-3">
                  <Badge variant={product.stock === 0 ? 'danger' : product.stock < 5 ? 'warning' : 'success'}>
                    {product.stock}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-center">
                  <Toggle checked={product.isFeatured} onChange={() => handleToggleFeatured(product)} />
                </td>
                <td className="px-4 py-3 text-center">
                  <Toggle checked={product.isActive} onChange={() => handleToggleActive(product)} />
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <Button size="sm" variant="outline" aria-label="Edit product">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="danger"
                      aria-label="Delete product"
                      isLoading={deletingId === product.id}
                      onClick={() => handleDelete(product)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {products.map((product) => {
        const primaryImage = product.media?.find((m) => m.isPrimary) || product.media?.[0];
        return (
          <div
            key={product.id}
            className="bg-[var(--color-surface)] rounded-[var(--radius)] border border-[var(--color-border)] overflow-hidden"
          >
            <div className="relative h-40 bg-[var(--color-background)]">
              {primaryImage ? (
                <Image src={primaryImage.url} alt={product.name} fill className="object-cover" />
              ) : null}
            </div>
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-xs text-[var(--color-text-muted)]">{product.sku}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {product.category && <Badge variant="outline" className="text-[10px]">{product.category.name}</Badge>}
                <Badge variant={product.isActive ? 'success' : 'danger'} className="text-[10px]">
                  {product.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[var(--color-primary)]">{formatPrice(Number(product.priceKes))}</span>
                <span className="text-sm text-[var(--color-text-muted)]">Stock: {product.stock}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-1">
                    Featured <Toggle checked={product.isFeatured} onChange={() => handleToggleFeatured(product)} />
                  </label>
                  <label className="flex items-center gap-1">
                    Active <Toggle checked={product.isActive} onChange={() => handleToggleActive(product)} />
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/products/${product.id}/edit`}>
                    <Button size="sm" variant="outline" aria-label="Edit product">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="danger"
                    aria-label="Delete product"
                    isLoading={deletingId === product.id}
                    onClick={() => handleDelete(product)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new">
          <Button><Plus className="h-4 w-4" /> New Product</Button>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name..."
            className="pl-9"
          />
        </div>
        <div className="flex rounded-[var(--radius)] border border-[var(--color-border)] overflow-hidden self-start">
          <button
            type="button"
            onClick={() => setView('grid')}
            className={`p-2 ${view === 'grid' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface)]'}`}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            className={`p-2 ${view === 'list' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface)]'}`}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          onClick={() => setCategorySlug('')}
          className={`px-3 py-1.5 rounded-full text-sm border ${
            !categorySlug
              ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
              : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategorySlug(cat.slug)}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              categorySlug === cat.slug
                ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12" />)}</div>
      ) : products.length === 0 ? (
        <p className="text-center py-8 text-[var(--color-text-muted)]">No products found.</p>
      ) : view === 'grid' ? (
        renderGrid()
      ) : (
        renderList()
      )}
    </div>
  );
}

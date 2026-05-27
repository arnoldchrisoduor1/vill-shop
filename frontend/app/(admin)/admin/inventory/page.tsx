'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Badge, Card, CardContent, ProductCardSkeleton } from '@/components/ui';
import { getLowStockProducts } from '@/lib/api/stats';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/types';

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLowStockProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">Inventory</h1>

      <Card className="mb-8">
        <CardContent>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <h2 className="font-semibold">Low Stock Alert</h2>
          </div>
          <p className="mt-2 text-muted">
            {loading ? 'Loading...' : `${products.length} products need restocking`}
          </p>
        </CardContent>
      </Card>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background">
              <th className="px-4 py-3 text-left font-medium">Product</th>
              <th className="px-4 py-3 text-left font-medium">SKU</th>
              <th className="px-4 py-3 text-left font-medium">Price</th>
              <th className="px-4 py-3 text-left font-medium">Stock</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}><td colSpan={4} className="p-4"><ProductCardSkeleton /></td></tr>
              ))
            ) : products.length === 0 ? (
              <tr><td colSpan={4} className="py-8 text-center text-muted">All products are well stocked</td></tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3 text-muted">{product.sku}</td>
                  <td className="px-4 py-3">{formatCurrency(product.price)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={product.stock <= 5 ? 'error' : 'warning'}>
                      {product.stock} left
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

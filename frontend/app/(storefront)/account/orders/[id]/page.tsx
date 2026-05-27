'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Download, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Badge, Button, Card, CardContent } from '@/components/ui';
import { downloadOrderItem, getOrder } from '@/lib/api/orders';
import { formatCurrency } from '@/lib/utils';
import type { Order } from '@/types';

export default function AccountOrderDetailPage() {
  const params = useParams();
  const orderNumber = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    getOrder(orderNumber)
      .then(setOrder)
      .catch(() => {
        toast.error('Failed to load order');
        setOrder(null);
      })
      .finally(() => setLoading(false));
  }, [orderNumber]);

  async function handleDownload(itemId: number) {
    setDownloadingId(itemId);
    try {
      const url = await downloadOrderItem(orderNumber, itemId);
      window.open(url, '_blank');
      toast.success('Download started');
    } catch {
      toast.error('Download unavailable for this item');
    } finally {
      setDownloadingId(null);
    }
  }

  if (loading) {
    return <p className="text-muted">Loading order...</p>;
  }

  if (!order) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Package className="mx-auto mb-4 h-12 w-12 text-muted" />
          <h2 className="text-lg font-semibold">Order not found</h2>
          <Link href="/account/orders" className="mt-4 inline-block text-primary hover:underline">
            Back to orders
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/account/orders" className="text-sm text-primary hover:underline">
            ← Back to orders
          </Link>
          <h1 className="mt-2 font-mono text-2xl font-bold">{order.order_number}</h1>
          <p className="text-sm text-muted">
            Placed {new Date(order.created_at).toLocaleDateString('en-KE')}
          </p>
        </div>
        <Badge variant="primary">{order.status}</Badge>
      </div>

      <Card>
        <CardContent className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4 last:border-0 last:pb-0">
              <div>
                <p className="font-semibold">{item.product_name}</p>
                <p className="text-sm text-muted">Qty: {item.quantity}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-semibold">{formatCurrency(item.total_price ?? item.total ?? 0, order.currency)}</p>
                {item.is_digital && order.status !== 'pending' && (
                  <Button
                    size="sm"
                    variant="outline"
                    isLoading={downloadingId === item.id}
                    onClick={() => handleDownload(item.id)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                )}
              </div>
            </div>
          ))}
          <div className="flex justify-between border-t border-border pt-4 font-bold">
            <span>Total</span>
            <span className="text-primary">{formatCurrency(order.total, order.currency)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

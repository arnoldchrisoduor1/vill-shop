'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ordersApi } from '../../../../../lib/api/orders';
import { paymentsApi } from '../../../../../lib/api/payments';
import { Button } from '../../../../../components/ui/Button';
import { Skeleton } from '../../../../../components/ui/Skeleton';
import { formatDate, formatPrice, getOrderStateColor } from '../../../../../lib/utils';
import { toast } from 'sonner';
import { Download } from 'lucide-react';
import type { Order } from '../../../../../types';

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    ordersApi.getOrder(id)
      .then(setOrder)
      .catch(() => toast.error('Order not found'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleDownload = async (itemId: string) => {
    try {
      const { url } = await ordersApi.getDownloadUrl(id!, itemId);
      window.open(url, '_blank');
    } catch {
      toast.error('Failed to get download link');
    }
  };

  const handlePayNow = async () => {
    if (!order) return;
    setIsPaying(true);
    try {
      const { redirectUrl } = await paymentsApi.initiate(order.id);
      if (!redirectUrl) {
        toast.error('Payment could not be started');
        return;
      }
      window.location.href = redirectUrl;
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Payment failed');
    } finally {
      setIsPaying(false);
    }
  };

  const isUnpaid = order?.state === 'PENDING' || order?.state === 'AWAITING_PAYMENT';

  if (isLoading) return <div className="space-y-4"><Skeleton variant="card" className="h-32" /></div>;
  if (!order) return <p>Order not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">{order.orderNumber}</h2>
        <div className="flex items-center gap-3">
          {isUnpaid && (
            <Button onClick={handlePayNow} isLoading={isPaying}>
              Complete Payment
            </Button>
          )}
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getOrderStateColor(order.state)}`}>
            {order.state}
          </span>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] rounded-[var(--radius)] border border-[var(--color-border)] p-6">
        <h3 className="font-medium mb-4">Order Items</h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
              <div>
                <p className="font-medium">{item.productName}</p>
                {item.variantName && <p className="text-sm text-[var(--color-text-muted)]">{item.variantName}</p>}
                <p className="text-sm text-[var(--color-text-muted)]">Qty: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatPrice(Number(item.priceDisplay) * item.quantity, item.currency)}</p>
                {item.digitalFileKey && (
                  <Button size="sm" variant="outline" onClick={() => handleDownload(item.id)} className="mt-1">
                    <Download className="h-3 w-3" /> Download
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1 text-sm text-right">
          <p>Subtotal: {formatPrice(Number(order.subtotal), order.currency)}</p>
          {Number(order.taxAmount) > 0 && <p>Tax: {formatPrice(Number(order.taxAmount), order.currency)}</p>}
          <p className="font-bold text-lg">Total: {formatPrice(Number(order.total), order.currency)}</p>
        </div>
      </div>

      {order.shippingAddress && (
        <div className="bg-[var(--color-surface)] rounded-[var(--radius)] border border-[var(--color-border)] p-6">
          <h3 className="font-medium mb-2">Shipping Address</h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            {Object.values(order.shippingAddress).filter(Boolean).join(', ')}
          </p>
        </div>
      )}

      <p className="text-sm text-[var(--color-text-muted)]">Placed on {formatDate(order.createdAt)}</p>
    </div>
  );
}

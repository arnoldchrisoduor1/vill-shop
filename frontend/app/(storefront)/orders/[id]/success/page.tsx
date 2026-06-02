import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Order Confirmed' };

export default function OrderSuccessPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <CheckCircle className="h-20 w-20 text-[var(--color-secondary)] mx-auto mb-6" />
      <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
      <p className="text-[var(--color-text-muted)] mb-8">
        Thank you for your purchase. You&apos;ll receive a confirmation email shortly.
      </p>
      <div className="flex justify-center gap-4">
        <Link href="/account/orders"
          className="rounded-[var(--radius)] bg-[var(--color-primary)] px-6 py-3 text-white font-medium hover:bg-[var(--color-primary-dark)] transition-colors">
          View My Orders
        </Link>
        <Link href="/products"
          className="rounded-[var(--radius)] border border-[var(--color-border)] px-6 py-3 font-medium hover:border-[var(--color-primary)] transition-colors">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

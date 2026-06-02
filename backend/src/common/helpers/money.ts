export function convertPrice(
  amountKes: number,
  currency: string,
  rates: Record<string, number>,
): number {
  if (currency === 'KES') return amountKes;
  const rate = rates[currency];
  if (!rate) return amountKes;
  return Math.round((amountKes / rate) * 100) / 100;
}

export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `VS-${dateStr}-${rand}`;
}

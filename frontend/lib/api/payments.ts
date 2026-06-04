import { apiFetch, apiPost } from './apiFetch';

export const paymentsApi = {
  initiate: (orderId: string) =>
    apiPost<{ redirectUrl: string }>('/api/v1/payments/initiate', { orderId }),
};

export async function initiatePayment(payload: {
  orderId: string;
  currency: string;
  callbackUrl?: string;
}) {
  return apiFetch<{ redirectUrl: string; reference: string }>(
    '/api/v1/payments/initiate',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

export async function getPaymentStatus(orderTrackingId: string) {
  return apiFetch<{
    orderId: string | null;
    paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    orderState: string | null;
  }>(`/api/v1/payments/status/${orderTrackingId}`);
}

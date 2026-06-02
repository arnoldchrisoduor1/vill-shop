export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface Payment {
  id: string;
  provider: string;
  providerRef?: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  createdAt: string;
}

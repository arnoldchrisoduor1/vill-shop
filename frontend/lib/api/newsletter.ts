import { apiPost, apiFetch } from './apiFetch';

export const newsletterApi = {
  subscribe: (email: string) => apiPost<{ message: string }>('/api/v1/newsletter/subscribe', { email }),
};

export const subscribe = (email: string) =>
  apiFetch<{ subscribed: boolean }>('/api/v1/newsletter/subscribe', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

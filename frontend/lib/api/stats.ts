import { apiGet, apiFetch } from './apiFetch';
import type { StoreStats, AdminDashboard } from '../../types';

export const statsApi = {
  getStats: () => apiGet<StoreStats>('/api/v1/stats'),
  getAdminDashboard: () => apiGet<AdminDashboard>('/api/v1/admin/dashboard'),
};

export const getStats = () =>
  apiFetch<StoreStats>('/api/v1/stats');

export const getAdminDashboard = () =>
  apiFetch<AdminDashboard>('/api/v1/admin/dashboard');

export const getRevenueReport = (params: { from: string; to: string }) => {
  const qs = new URLSearchParams(params);
  return apiFetch<{ labels: string[]; values: number[]; total: number }>(
    `/api/v1/admin/reports/revenue?${qs.toString()}`
  );
};

export const exportReportCsv = (params: { from: string; to: string }): string => {
  const qs = new URLSearchParams(params);
  return `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/reports/export?${qs.toString()}`;
};

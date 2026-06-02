'use client';

import { useState } from 'react';
import { apiFetch } from '../../../../lib/api/apiFetch';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { formatPrice } from '../../../../lib/utils';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

interface RevenueDay {
  date: string;
  revenue: number;
  orderCount: number;
}

export default function AdminReportsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 86400 * 1000).toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(monthAgo);
  const [endDate, setEndDate] = useState(today);
  const [data, setData] = useState<RevenueDay[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch<RevenueDay[]>(`/api/v1/admin/reports?startDate=${startDate}&endDate=${endDate}`);
      setData(res.data ?? []);
    } catch { toast.error('Failed to load report'); }
    finally { setIsLoading(false); }
  };

  const exportCsv = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/reports/export?startDate=${startDate}&endDate=${endDate}`, { credentials: 'include' });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `revenue-${startDate}-to-${endDate}.csv`;
      a.click();
    } catch { toast.error('Export failed'); }
  };

  const totalRevenue = data.reduce((sum, d) => sum + Number(d.revenue), 0);
  const maxRevenue = Math.max(...data.map((d) => Number(d.revenue)), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Revenue Reports</h1>
        <Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4" /> Export CSV</Button>
      </div>

      <div className="flex items-end gap-4">
        <Input label="From" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input label="To" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <Button onClick={fetchReport} isLoading={isLoading}>Generate Report</Button>
      </div>

      {data.length > 0 && (
        <>
          <div className="bg-[var(--color-surface)] rounded-[var(--radius)] border border-[var(--color-border)] p-6">
            <p className="text-sm text-[var(--color-text-muted)] mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-[var(--color-primary)]">{formatPrice(totalRevenue)}</p>
          </div>

          <div className="bg-[var(--color-surface)] rounded-[var(--radius)] border border-[var(--color-border)] p-6">
            <h2 className="font-semibold mb-4">Daily Revenue</h2>
            <div className="space-y-2">
              {data.map((day) => (
                <div key={day.date} className="flex items-center gap-4">
                  <span className="text-sm text-[var(--color-text-muted)] w-24 shrink-0">{day.date}</span>
                  <div className="flex-1 bg-[var(--color-background)] rounded-full h-6 relative overflow-hidden">
                    <div
                      className="h-full bg-[var(--color-primary)] rounded-full transition-all"
                      style={{ width: `${(Number(day.revenue) / maxRevenue) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-24 text-right">{formatPrice(Number(day.revenue))}</span>
                  <span className="text-xs text-[var(--color-text-muted)] w-16 text-right">{day.orderCount} orders</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

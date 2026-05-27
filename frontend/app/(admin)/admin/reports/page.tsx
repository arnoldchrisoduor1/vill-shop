'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, CardContent } from '@/components/ui';
import { downloadOrdersReport } from '@/lib/api/orders';

export default function AdminReportsPage() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadOrdersReport();
      toast.success('Report downloaded');
    } catch {
      toast.error('Failed to download report');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">Reports</h1>

      <div className="grid max-w-2xl gap-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent>
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Orders Export</h2>
              </div>
              <p className="mb-6 text-sm text-muted">
                Download a CSV report of all orders including order number, status, customer email,
                totals, and timestamps.
              </p>
              <Button onClick={handleDownload} isLoading={downloading}>
                <Download className="h-4 w-4" />
                Download Orders CSV
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

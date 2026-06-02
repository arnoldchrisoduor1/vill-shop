import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OrderState } from '../database/entities/order.entity';

interface RevenueRow {
  date: string;
  revenue: string;
  orderCount: string;
}

@Injectable()
export class ReportsService {
  constructor(private dataSource: DataSource) {}

  async getRevenueReport(
    startDate: string,
    endDate: string,
    currency = 'KES',
  ): Promise<{ date: string; revenue: number; orderCount: number }[]> {
    const paidStates = [
      OrderState.PAID,
      OrderState.PROCESSING,
      OrderState.SHIPPED,
      OrderState.DELIVERED,
    ];

    const rows = await this.dataSource.query<RevenueRow[]>(
      `
      SELECT 
        DATE(o.created_at)::text AS date,
        COALESCE(SUM(o.total), 0)::text AS revenue,
        COUNT(o.id)::text AS "orderCount"
      FROM orders o
      WHERE o.created_at >= $1::date
        AND o.created_at < ($2::date + INTERVAL '1 day')
        AND o.currency = $3
        AND o.state::text = ANY($4::text[])
        AND o.deleted_at IS NULL
      GROUP BY DATE(o.created_at)
      ORDER BY DATE(o.created_at) ASC
      `,
      [startDate, endDate, currency, paidStates],
    );

    return rows.map((r) => ({
      date: r.date,
      revenue: Number(r.revenue),
      orderCount: Number(r.orderCount),
    }));
  }

  exportCsv(data: Record<string, unknown>[]): string {
    if (!data.length) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((h) => {
            const val = row[h];
            if (val === null || val === undefined) return '';
            const str = String(val);
            return str.includes(',') || str.includes('"') || str.includes('\n')
              ? `"${str.replace(/"/g, '""')}"`
              : str;
          })
          .join(','),
      ),
    ];

    return csvRows.join('\n');
  }
}

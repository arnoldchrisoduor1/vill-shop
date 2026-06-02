export interface StoreStats {
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
}

export interface AdminDashboard {
  revenueToday: number;
  revenueWeek: number;
  revenueMonth: number;
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    total: number;
  };
  stats: StoreStats;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    state: string;
    total: number;
    currency: string;
    customerName: string;
    user: { name: string };
    createdAt: string;
  }>;
  lowStockProducts: Array<{
    id: string;
    name: string;
    sku: string;
    stock: number;
  }>;
}

export interface PublicStats {
  total_orders: number;
  total_products: number;
  total_customers: number;
}

export interface DashboardStats {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  total_products: number;
  revenue_change: number;
  orders_change: number;
  customers_change: number;
  low_stock_count: number;
}

export interface SalesReport {
  period: string;
  revenue: number;
  orders: number;
  average_order_value: number;
}

export interface TopProduct {
  product_id: number;
  product_name: string;
  total_sold: number;
  revenue: number;
}

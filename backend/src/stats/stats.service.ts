import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Payment, PaymentStatus } from '../database/entities/payment.entity';
import { Order, OrderState } from '../database/entities/order.entity';
import { Product } from '../database/entities/product.entity';
import { User, UserRole } from '../database/entities/user.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async getCounts(): Promise<{
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
  }> {
    const cacheKey = 'stats:counts';
    const cached = await this.cacheManager.get<{
      totalOrders: number;
      totalProducts: number;
      totalCustomers: number;
    }>(cacheKey);
    if (cached) return cached;

    const [totalOrders, totalProducts, totalCustomers] = await Promise.all([
      this.orderRepo.count({
        where: [
          { state: OrderState.PAID },
          { state: OrderState.PROCESSING },
          { state: OrderState.SHIPPED },
          { state: OrderState.DELIVERED },
        ],
      }),
      this.productRepo.count({ where: { isActive: true } }),
      this.userRepo.count({ where: { role: UserRole.CUSTOMER } }),
    ]);

    const result = { totalOrders, totalProducts, totalCustomers };
    await this.cacheManager.set(cacheKey, result, 3600000);
    return result;
  }

  async getAdminDashboard(): Promise<Record<string, unknown>> {
    const now = new Date();

    const todayMidnight = new Date(now);
    todayMidnight.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const paidStates = [
      OrderState.PAID,
      OrderState.PROCESSING,
      OrderState.SHIPPED,
      OrderState.DELIVERED,
    ];

    const [revenueToday, revenueWeek, revenueMonth, recentOrders, lowStockProducts, topProducts] =
      await Promise.all([
        this.sumCompletedRevenue(todayMidnight),
        this.sumCompletedRevenue(sevenDaysAgo),
        this.sumCompletedRevenue(thirtyDaysAgo),

        this.orderRepo.find({
          relations: { user: true },
          order: { createdAt: 'DESC' },
          take: 10,
        }),

        this.productRepo
          .createQueryBuilder('p')
          .where('p.stock <= :threshold', { threshold: 5 })
          .andWhere('p.isActive = true')
          .orderBy('p.stock', 'ASC')
          .take(20)
          .getMany(),

        this.orderRepo
          .createQueryBuilder('o')
          .innerJoin('o.items', 'item')
          .select('item.productId', 'productId')
          .addSelect('SUM(item.quantity)', 'totalSold')
          .where('o.state IN (:...states)', { states: paidStates })
          .groupBy('item.productId')
          .orderBy('totalSold', 'DESC')
          .limit(5)
          .getRawMany<{ productId: string; totalSold: string }>(),
      ]);

    return {
      revenueToday,
      revenueWeek,
      revenueMonth,
      recentOrders,
      lowStockProducts,
      topProducts,
    };
  }

  private async sumCompletedRevenue(since: Date): Promise<number> {
    const row = await this.paymentRepo
      .createQueryBuilder('p')
      .select('COALESCE(SUM(p.amount), 0)', 'revenue')
      .where('p.status = :status', { status: PaymentStatus.COMPLETED })
      .andWhere('p.updated_at >= :start', { start: since })
      .getRawOne<{ revenue: string }>();

    return Number(row?.revenue ?? 0);
  }
}

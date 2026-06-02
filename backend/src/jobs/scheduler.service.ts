import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Product } from '../database/entities/product.entity';
import { Cart } from '../database/entities/cart.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectQueue('exchange-rates')
    private exchangeRatesQueue: Queue,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Cart)
    private cartRepo: Repository<Cart>,
    private mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async fetchExchangeRates(): Promise<void> {
    this.logger.log('Scheduling exchange rate fetch');
    await this.exchangeRatesQueue.add('fetch-rates', {}, { attempts: 3, backoff: 5000 });
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupStaleCarts(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.cartRepo
      .createQueryBuilder()
      .delete()
      .where('"updated_at" < :cutoff', { cutoff: thirtyDaysAgo })
      .execute();

    this.logger.log(`Cleaned up ${result.affected ?? 0} stale carts`);
  }

  @Cron(CronExpression.EVERY_HOUR)
  async checkLowStock(): Promise<void> {
    const lowStockThreshold = 5;
    const products = await this.productRepo
      .createQueryBuilder('p')
      .where('p.stock <= :threshold', { threshold: lowStockThreshold })
      .andWhere('p.stock > 0')
      .andWhere('p.isActive = true')
      .andWhere('p.deletedAt IS NULL')
      .getMany();

    for (const product of products) {
      await this.mailService
        .sendLowStockAlert(product.name, product.stock)
        .catch((err: unknown) =>
          this.logger.error(`Failed to send low stock alert for ${product.name}`, err),
        );
    }

    if (products.length > 0) {
      this.logger.log(`Low stock alerts sent for ${products.length} products`);
    }
  }
}

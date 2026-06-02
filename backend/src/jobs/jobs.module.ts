import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { SendReceiptProcessor } from './send-receipt.processor';
import { ProcessWebhookProcessor } from './process-webhook.processor';
import { FetchExchangeRatesProcessor } from './fetch-exchange-rates.processor';
import { SchedulerService } from './scheduler.service';
import { Order } from '../database/entities/order.entity';
import { User } from '../database/entities/user.entity';
import { Product } from '../database/entities/product.entity';
import { WebhookLog } from '../database/entities/webhook-log.entity';
import { Payment } from '../database/entities/payment.entity';
import { ExchangeRate } from '../database/entities/exchange-rate.entity';
import { Cart } from '../database/entities/cart.entity';
import { MailModule } from '../mail/mail.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      User,
      Product,
      WebhookLog,
      Payment,
      ExchangeRate,
      Cart,
    ]),
    BullModule.registerQueue(
      { name: 'receipt' },
      { name: 'webhooks' },
      { name: 'exchange-rates' },
    ),
    MailModule,
    PaymentsModule,
  ],
  providers: [
    SendReceiptProcessor,
    ProcessWebhookProcessor,
    FetchExchangeRatesProcessor,
    SchedulerService,
  ],
  exports: [SchedulerService],
})
export class JobsModule {}

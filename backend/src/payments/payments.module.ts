import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment } from '../database/entities/payment.entity';
import { Order } from '../database/entities/order.entity';
import { WebhookLog } from '../database/entities/webhook-log.entity';
import { User } from '../database/entities/user.entity';
import { OrderStateService } from '../orders/order-state.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Order, WebhookLog, User]),
    BullModule.registerQueue({ name: 'webhooks' }),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, OrderStateService],
  exports: [PaymentsService],
})
export class PaymentsModule {}

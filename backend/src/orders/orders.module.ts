import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderStateService } from './order-state.service';
import { Order } from '../database/entities/order.entity';
import { OrderItem } from '../database/entities/order-item.entity';
import { Payment } from '../database/entities/payment.entity';
import { Product } from '../database/entities/product.entity';
import { ProductVariant } from '../database/entities/product-variant.entity';
import { Cart } from '../database/entities/cart.entity';
import { ExchangeRate } from '../database/entities/exchange-rate.entity';
import { FeatureFlag } from '../database/entities/feature-flag.entity';
import { User } from '../database/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order, OrderItem, Payment, Product, ProductVariant,
      Cart, ExchangeRate, FeatureFlag, User,
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrderStateService],
  exports: [OrdersService],
})
export class OrdersModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { Order } from '../database/entities/order.entity';
import { Product } from '../database/entities/product.entity';
import { User } from '../database/entities/user.entity';

import { Payment } from '../database/entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Product, User, Payment])],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}

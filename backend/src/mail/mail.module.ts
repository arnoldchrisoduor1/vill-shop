import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { MailService } from './mail.service';
import { MailNotificationListener } from './mail-notification.listener';
import { Order } from '../database/entities/order.entity';
import { User } from '../database/entities/user.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Order, User]),
    BullModule.registerQueue({ name: 'receipt' }),
  ],
  providers: [MailService, MailNotificationListener],
  exports: [MailService],
})
export class MailModule {}

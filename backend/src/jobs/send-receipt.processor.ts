import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bull';
import { Order } from '../database/entities/order.entity';
import { User } from '../database/entities/user.entity';
import { MailService } from '../mail/mail.service';

@Processor('receipt')
export class SendReceiptProcessor {
  private readonly logger = new Logger(SendReceiptProcessor.name);

  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private mailService: MailService,
  ) {}

  @Process('send-receipt')
  async handle(job: Job<{ orderId: string }>): Promise<void> {
    const { orderId } = job.data;

    try {
      const order = await this.orderRepo.findOne({
        where: { id: orderId },
        relations: { items: true, user: true },
      });

      if (!order) {
        this.logger.warn(`Order ${orderId} not found for receipt`);
        return;
      }

      const user = order.user ?? await this.userRepo.findOne({ where: { id: order.userId } });
      if (!user) {
        this.logger.warn(`User not found for order ${orderId}`);
        return;
      }

      await this.mailService.sendReceipt(order, user);
      this.logger.log(`Receipt sent for order ${orderId}`);
    } catch (err) {
      this.logger.error(`Failed to send receipt for order ${orderId}`, err);
      throw err;
    }
  }
}

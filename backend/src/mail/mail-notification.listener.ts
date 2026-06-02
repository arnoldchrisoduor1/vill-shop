import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Repository } from 'typeorm';
import { MailService } from './mail.service';
import { Order, OrderState } from '../database/entities/order.entity';
import { User } from '../database/entities/user.entity';

@Injectable()
export class MailNotificationListener {
  private readonly logger = new Logger(MailNotificationListener.name);

  constructor(
    private readonly mailService: MailService,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectQueue('receipt')
    private readonly receiptQueue: Queue,
  ) {}

  private async loadOrderContext(orderId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: { items: true, user: true },
    });
    if (!order) return null;

    const user =
      order.user ??
      (await this.userRepo.findOne({ where: { id: order.userId } }));
    if (!user) return null;

    return { order, user };
  }

  @OnEvent('order.created')
  async handleOrderCreated(payload: { order: Order; userId: string }) {
    const context = await this.loadOrderContext(payload.order.id);
    if (!context) return;
    await this.mailService.sendOrderPlaced(context.order, context.user);
  }

  @OnEvent('order.paid')
  async handleOrderPaid(payload: { order: Order }) {
    const context = await this.loadOrderContext(payload.order.id);
    if (!context) return;

    await this.mailService.sendPaymentSuccessful(context.order, context.user);
    await this.receiptQueue.add('send-receipt', { orderId: context.order.id });
  }

  @OnEvent('order.processing')
  async handleProcessing(payload: { order: Order }) {
    await this.handleStatus(payload.order.id, OrderState.PROCESSING);
  }

  @OnEvent('order.awaiting_payment')
  async handleAwaitingPayment(payload: { order: Order }) {
    await this.handleStatus(payload.order.id, OrderState.AWAITING_PAYMENT);
  }

  @OnEvent('order.shipped')
  async handleShipped(payload: { order: Order }) {
    await this.handleStatus(payload.order.id, OrderState.SHIPPED);
  }

  @OnEvent('order.delivered')
  async handleDelivered(payload: { order: Order }) {
    await this.handleStatus(payload.order.id, OrderState.DELIVERED);
  }

  @OnEvent('order.cancelled')
  async handleCancelled(payload: { order: Order }) {
    await this.handleStatus(payload.order.id, OrderState.CANCELLED);
  }

  @OnEvent('order.refunded')
  async handleRefunded(payload: { order: Order }) {
    await this.handleStatus(payload.order.id, OrderState.REFUNDED);
  }

  @OnEvent('user.banned')
  async handleUserBanned(payload: { user: User }) {
    await this.mailService.sendAccountBanned(payload.user);
  }

  @OnEvent('user.unbanned')
  async handleUserUnbanned(payload: { user: User }) {
    await this.mailService.sendAccountUnbanned(payload.user);
  }

  private async handleStatus(orderId: string, state: OrderState) {
    const context = await this.loadOrderContext(orderId);
    if (!context) return;

    try {
      await this.mailService.sendStatusForState(context.order, context.user, state);
    } catch (err) {
      this.logger.error(`Failed to send ${state} email for order ${orderId}`, err);
    }
  }
}

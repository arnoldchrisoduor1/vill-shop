import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EventEmitter2 } from '@nestjs/event-emitter';
import axios from 'axios';
import { Payment, PaymentStatus } from '../database/entities/payment.entity';
import { Order, OrderState } from '../database/entities/order.entity';
import { WebhookLog } from '../database/entities/webhook-log.entity';
import { User } from '../database/entities/user.entity';
import { OrderStateService } from '../orders/order-state.service';

interface PesapalToken {
  token: string;
  expiresAt: number;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly pesapalBaseUrl: string;
  private cachedToken: PesapalToken | null = null;

  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(WebhookLog)
    private webhookLogRepo: Repository<WebhookLog>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private orderStateService: OrderStateService,
    @InjectQueue('webhooks')
    private webhooksQueue: Queue,
    private eventEmitter: EventEmitter2,
  ) {
    this.pesapalBaseUrl =
      process.env.PESAPAL_ENV === 'production'
        ? 'https://pay.pesapal.com/v3'
        : 'https://cybqa.pesapal.com/pesapalv3';

    if (this.isSimulateMode()) {
      this.logger.warn(
        'Pesapal simulate mode active — payments skip the real gateway (set PESAPAL_CONSUMER_KEY/SECRET to use Pesapal)',
      );
    }
  }

  private isSimulateMode(): boolean {
    if (process.env.PESAPAL_SIMULATE === 'true') return true;
    const key = process.env.PESAPAL_CONSUMER_KEY?.trim();
    const secret = process.env.PESAPAL_CONSUMER_SECRET?.trim();
    return !key || !secret;
  }

  private getBackendUrl(): string {
    return process.env.BACKEND_URL ?? process.env.API_URL ?? 'http://localhost:8081';
  }

  async getPesapalToken(): Promise<string> {
    const now = Date.now();
    if (this.cachedToken && this.cachedToken.expiresAt > now) {
      return this.cachedToken.token;
    }

    const response = await axios.post(
      `${this.pesapalBaseUrl}/api/Auth/RequestToken`,
      {
        consumer_key: process.env.PESAPAL_CONSUMER_KEY,
        consumer_secret: process.env.PESAPAL_CONSUMER_SECRET,
      },
      { headers: { Accept: 'application/json', 'Content-Type': 'application/json' } },
    );

    const token = response.data.token as string;
    // Cache for 55 minutes
    this.cachedToken = { token, expiresAt: now + 55 * 60 * 1000 };
    return token;
  }

  async initiatePesapal(orderId: string, userId: string): Promise<{ redirectUrl: string }> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: { user: true, items: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new BadRequestException('Access denied');

    if (![OrderState.PENDING, OrderState.AWAITING_PAYMENT].includes(order.state)) {
      throw new BadRequestException('Order is not awaiting payment');
    }

    if (this.isSimulateMode()) {
      return this.initiateSimulatedPayment(order);
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const token = await this.getPesapalToken();

    // Register IPN URL first (simplified: assume already registered)
    const ipnUrl = `${process.env.API_URL ?? 'http://localhost:3000'}/api/webhooks/pesapal`;

    const submitPayload = {
      id: order.id,
      currency: order.currency,
      amount: Number(order.total),
      description: `Vill Shop Order #${order.orderNumber}`,
      callback_url: `${process.env.API_URL ?? 'http://localhost:3000'}/api/v1/payments/callback`,
      notification_id: process.env.PESAPAL_IPN_ID ?? '',
      billing_address: {
        email_address: user.email,
        phone_number: user.phone ?? '',
        first_name: user.name.split(' ')[0],
        last_name: user.name.split(' ').slice(1).join(' ') || user.name,
      },
    };

    const submitResponse = await axios.post(
      `${this.pesapalBaseUrl}/api/Transactions/SubmitOrderRequest`,
      submitPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    );

    const { redirect_url, order_tracking_id } = submitResponse.data;

    // Update payment with provider ref
    await this.paymentRepo.update(
      { orderId },
      { providerRef: order_tracking_id },
    );

    // Transition order to awaiting payment
    this.orderStateService.transition(order, OrderState.AWAITING_PAYMENT);
    await this.orderRepo.save(order);

    return { redirectUrl: redirect_url };
  }

  private async initiateSimulatedPayment(order: Order): Promise<{ redirectUrl: string }> {
    const trackingId = `sim-${order.id}-${Date.now().toString(36)}`;

    await this.paymentRepo.update(
      { orderId: order.id },
      {
        provider: 'simulate',
        providerRef: trackingId,
        metadata: { simulated: true },
      },
    );

    if (order.state === OrderState.PENDING) {
      this.orderStateService.transition(order, OrderState.AWAITING_PAYMENT);
      await this.orderRepo.save(order);
    }

    this.logger.log(`Simulated payment initiated for order ${order.id}`);

    const backendUrl = this.getBackendUrl();
    return {
      redirectUrl: `${backendUrl}/api/v1/payments/simulate?OrderTrackingId=${encodeURIComponent(trackingId)}`,
    };
  }

  async completeSimulatedPayment(orderTrackingId: string): Promise<{ orderId: string }> {
    if (!orderTrackingId.startsWith('sim-')) {
      throw new BadRequestException('Invalid simulated payment reference');
    }

    const payment = await this.paymentRepo.findOne({
      where: { providerRef: orderTrackingId },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    const order = await this.orderRepo.findOne({ where: { id: payment.orderId } });
    if (!order) throw new NotFoundException('Order not found');

    if (payment.status !== PaymentStatus.COMPLETED) {
      payment.status = PaymentStatus.COMPLETED;
      payment.metadata = {
        ...payment.metadata,
        simulated: true,
        completedAt: new Date().toISOString(),
      };
      await this.paymentRepo.save(payment);
    }

    if (order.state !== OrderState.PAID) {
      this.markOrderAsPaid(order);
      await this.orderRepo.save(order);
      this.eventEmitter.emit('order.paid', { order });
    }

    this.logger.log(`Simulated payment completed for order ${order.id}`);
    return { orderId: order.id };
  }

  async handleWebhook(
    payload: Record<string, unknown>,
    headers: Record<string, unknown>,
  ): Promise<{ received: boolean }> {
    const orderTrackingId = (payload.OrderTrackingId ?? payload.orderTrackingId) as string;

    if (!orderTrackingId) {
      this.logger.warn('Webhook received without OrderTrackingId');
      return { received: true };
    }

    // Idempotency: skip if already logged
    const existing = await this.webhookLogRepo.findOne({
      where: { idempotencyKey: orderTrackingId },
    });

    let webhookLog: WebhookLog;
    if (!existing) {
      webhookLog = await this.webhookLogRepo.save(
        this.webhookLogRepo.create({
          provider: 'pesapal',
          payload,
          headers,
          idempotencyKey: orderTrackingId,
          processed: false,
        }),
      );
    } else {
      webhookLog = existing;
    }

    await this.webhooksQueue.add(
      'process-pesapal',
      { orderTrackingId, webhookLogId: webhookLog.id },
      { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
    );

    return { received: true };
  }

  async verifyAndUpdatePayment(orderTrackingId: string): Promise<void> {
    if (orderTrackingId.startsWith('sim-')) {
      await this.completeSimulatedPayment(orderTrackingId);
      return;
    }

    const token = await this.getPesapalToken();

    const response = await axios.get(
      `${this.pesapalBaseUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    );

    const { payment_status_description, order_merchant_reference } = response.data;

    const payment = await this.paymentRepo.findOne({
      where: { providerRef: orderTrackingId },
    });

    if (!payment) {
      // Try by order id
      const order = await this.orderRepo.findOne({
        where: { id: order_merchant_reference },
      });
      if (!order) {
        this.logger.warn(`No order found for tracking id: ${orderTrackingId}`);
        return;
      }
    }

    const orderId = payment?.orderId ?? order_merchant_reference;
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) return;

    const paymentRecord = payment ?? await this.paymentRepo.findOne({ where: { orderId } });
    if (!paymentRecord) return;

    if (payment_status_description === 'Completed') {
      paymentRecord.status = PaymentStatus.COMPLETED;
      await this.paymentRepo.save(paymentRecord);

      if (order.state !== OrderState.PAID) {
        try {
          this.markOrderAsPaid(order);
          await this.orderRepo.save(order);
          this.eventEmitter.emit('order.paid', { order });
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          this.logger.warn(`Could not transition order ${order.id} to PAID: ${msg}`);
        }
      }
    } else if (['Failed', 'Invalid'].includes(payment_status_description)) {
      paymentRecord.status = PaymentStatus.FAILED;
      await this.paymentRepo.save(paymentRecord);

      if ([OrderState.PENDING, OrderState.AWAITING_PAYMENT].includes(order.state)) {
        try {
          this.orderStateService.transition(order, OrderState.CANCELLED);
          await this.orderRepo.save(order);
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          this.logger.warn(`Could not cancel order ${order.id}: ${msg}`);
        }
      }
    }
  }

  async refund(orderId: string): Promise<Payment> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const payment = await this.paymentRepo.findOne({ where: { orderId } });
    if (!payment) throw new NotFoundException('Payment not found');

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Only completed payments can be refunded');
    }

    if (payment.provider === 'simulate' || this.isSimulateMode()) {
      payment.status = PaymentStatus.REFUNDED;
      await this.paymentRepo.save(payment);
      this.orderStateService.transition(order, OrderState.REFUNDED);
      await this.orderRepo.save(order);
      return payment;
    }

    const token = await this.getPesapalToken();

    try {
      await axios.post(
        `${this.pesapalBaseUrl}/api/Transactions/RefundRequest`,
        {
          confirmation_code: payment.providerRef,
          merchant_reference: orderId,
          amount: Number(payment.amount),
          username: process.env.PESAPAL_USERNAME ?? '',
          remarks: 'Customer refund',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error('Pesapal refund failed', msg);
      throw new BadRequestException('Refund request failed');
    }

    payment.status = PaymentStatus.REFUNDED;
    await this.paymentRepo.save(payment);

    this.orderStateService.transition(order, OrderState.REFUNDED);
    await this.orderRepo.save(order);

    return payment;
  }

  private markOrderAsPaid(order: Order): void {
    if (
      order.state === OrderState.PAID ||
      order.state === OrderState.PROCESSING ||
      order.state === OrderState.SHIPPED ||
      order.state === OrderState.DELIVERED
    ) {
      return;
    }

    if (order.state === OrderState.PENDING) {
      this.orderStateService.transition(order, OrderState.AWAITING_PAYMENT);
    }

    if (order.state === OrderState.AWAITING_PAYMENT) {
      this.orderStateService.transition(order, OrderState.PAID);
    }
  }
}

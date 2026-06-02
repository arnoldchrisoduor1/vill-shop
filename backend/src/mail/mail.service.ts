import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Order, OrderState } from '../database/entities/order.entity';
import { User } from '../database/entities/user.entity';
import {
  buildOrderItemsRows,
  formatMoney,
  renderEmail,
} from './mail-template.util';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const useTls = process.env.SMTP_USE_TLS === 'true';
    const password = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port,
      secure: useTls,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: password }
        : undefined,
      requireTLS: process.env.SMTP_USE_STARTTLS === 'true' && !useTls,
    });
  }

  private get from(): string {
    const name = process.env.EMAIL_FROM_NAME || 'Vill Shop';
    const address =
      process.env.EMAIL_FROM_ADDRESS ||
      process.env.SMTP_USER ||
      'noreply@villshop.com';
    return `${name} <${address}>`;
  }

  private get frontendUrl(): string {
    return process.env.FRONTEND_URL ?? 'http://localhost:3000';
  }

  private async deliver(to: string, subject: string, html: string): Promise<void> {
    if (process.env.EMAIL_DRY_RUN === 'true') {
      this.logger.log(`[DRY RUN] Email to ${to} — ${subject}`);
      return;
    }

    await this.transporter.sendMail({ from: this.from, to, subject, html });
  }

  private orderVars(order: Order, user: User): Record<string, string> {
    const items = order.items ?? [];
    return {
      customerName: user.name,
      orderNumber: order.orderNumber,
      orderDate: order.createdAt
        ? new Date(order.createdAt).toLocaleString('en-KE')
        : new Date().toLocaleString('en-KE'),
      orderState: order.state,
      subtotal: formatMoney(order.subtotal, order.currency),
      tax: formatMoney(order.taxAmount, order.currency),
      total: formatMoney(order.total, order.currency),
      itemsRows: buildOrderItemsRows(items),
      ctaUrl: `${this.frontendUrl}/account/orders/${order.id}`,
      ctaLabel: 'View order',
    };
  }

  async sendOrderPlaced(order: Order, user: User): Promise<void> {
    const vars = this.orderVars(order, user);
    const html = renderEmail('order-placed', {
      ...vars,
      title: `Order received #${order.orderNumber}`,
      preheader: `We received order ${order.orderNumber}`,
      eyebrow: 'Order placed',
      headline: 'Thanks for your order',
      ctaLabel: 'Complete payment',
      ctaUrl: `${this.frontendUrl}/account/orders/${order.id}`,
    });

    try {
      await this.deliver(user.email, `Order received #${order.orderNumber}`, html);
    } catch (err) {
      this.logger.error(`Failed to send order placed email for ${order.id}`, err);
    }
  }

  async sendPaymentSuccessful(order: Order, user: User): Promise<void> {
    const vars = this.orderVars(order, user);
    const html = renderEmail('payment-success', {
      ...vars,
      title: `Payment confirmed #${order.orderNumber}`,
      preheader: `Payment received for order ${order.orderNumber}`,
      eyebrow: 'Payment successful',
      headline: 'Payment confirmed',
    });

    try {
      await this.deliver(
        user.email,
        `Payment confirmed #${order.orderNumber}`,
        html,
      );
    } catch (err) {
      this.logger.error(`Failed to send payment email for ${order.id}`, err);
    }
  }

  async sendReceipt(order: Order, user: User): Promise<void> {
    const vars = this.orderVars(order, user);
    const html = renderEmail('receipt', {
      ...vars,
      title: `Receipt #${order.orderNumber}`,
      preheader: `Receipt for order ${order.orderNumber}`,
      eyebrow: 'Receipt',
      headline: 'Your order receipt',
    });

    try {
      await this.deliver(
        user.email,
        `Receipt #${order.orderNumber}`,
        html,
      );
    } catch (err) {
      this.logger.error(`Failed to send receipt for order ${order.id}`, err);
    }
  }

  async sendOrderShipped(order: Order, user: User): Promise<void> {
    const vars = this.orderVars(order, user);
    const html = renderEmail('order-shipped', {
      ...vars,
      trackingNumber: order.trackingNumber || 'Not available yet',
      title: `Order shipped #${order.orderNumber}`,
      preheader: `Order ${order.orderNumber} is on the way`,
      eyebrow: 'Order shipped',
      headline: 'Your order is on the way',
    });

    try {
      await this.deliver(
        user.email,
        `Your order #${order.orderNumber} has shipped`,
        html,
      );
    } catch (err) {
      this.logger.error(`Failed to send shipped email for order ${order.id}`, err);
    }
  }

  async sendOrderDelivered(order: Order, user: User): Promise<void> {
    const vars = this.orderVars(order, user);
    const html = renderEmail('order-delivered', {
      ...vars,
      title: `Order delivered #${order.orderNumber}`,
      preheader: `Order ${order.orderNumber} was delivered`,
      eyebrow: 'Order delivered',
      headline: 'Delivered successfully',
    });

    try {
      await this.deliver(
        user.email,
        `Your order #${order.orderNumber} has been delivered`,
        html,
      );
    } catch (err) {
      this.logger.error(`Failed to send delivered email for order ${order.id}`, err);
    }
  }

  async sendOrderStatusUpdate(
    order: Order,
    user: User,
    statusLabel: string,
    statusMessage: string,
    accentColor = '#00b5b8',
  ): Promise<void> {
    const vars = this.orderVars(order, user);
    const html = renderEmail('order-status', {
      ...vars,
      statusLabel,
      statusMessage,
      accentColor,
      title: `Order update #${order.orderNumber}`,
      preheader: statusMessage,
      eyebrow: 'Order update',
      headline: statusLabel,
    });

    try {
      await this.deliver(
        user.email,
        `Order #${order.orderNumber} — ${statusLabel}`,
        html,
      );
    } catch (err) {
      this.logger.error(`Failed to send status email for order ${order.id}`, err);
    }
  }

  async sendStatusForState(order: Order, user: User, state: OrderState): Promise<void> {
    switch (state) {
      case OrderState.SHIPPED:
        await this.sendOrderShipped(order, user);
        return;
      case OrderState.DELIVERED:
        await this.sendOrderDelivered(order, user);
        return;
      case OrderState.PROCESSING:
        await this.sendOrderStatusUpdate(
          order,
          user,
          'Processing',
          'We are preparing your order for shipment.',
          '#2563eb',
        );
        return;
      case OrderState.AWAITING_PAYMENT:
        await this.sendOrderStatusUpdate(
          order,
          user,
          'Awaiting payment',
          'Your order is waiting for payment. Complete checkout to continue.',
          '#d97706',
        );
        return;
      case OrderState.CANCELLED:
        await this.sendOrderStatusUpdate(
          order,
          user,
          'Cancelled',
          'Your order has been cancelled. If you were charged, refunds are processed separately.',
          '#dc2626',
        );
        return;
      case OrderState.REFUNDED:
        await this.sendOrderStatusUpdate(
          order,
          user,
          'Refunded',
          'A refund has been issued for this order.',
          '#7c3aed',
        );
        return;
      default:
        return;
    }
  }

  async sendAccountBanned(user: User): Promise<void> {
    const html = renderEmail('account-banned', {
      customerName: user.name,
      supportEmail: process.env.ADMIN_EMAIL ?? process.env.EMAIL_FROM_ADDRESS ?? '',
      title: 'Account suspended',
      preheader: 'Your Vill Shop account has been suspended',
      eyebrow: 'Account notice',
      headline: 'Account suspended',
    });

    try {
      await this.deliver(user.email, 'Your Vill Shop account has been suspended', html);
    } catch (err) {
      this.logger.error(`Failed to send ban email to ${user.email}`, err);
    }
  }

  async sendAccountUnbanned(user: User): Promise<void> {
    const html = renderEmail('account-unbanned', {
      customerName: user.name,
      title: 'Account restored',
      preheader: 'Your Vill Shop account is active again',
      eyebrow: 'Account notice',
      headline: 'Welcome back',
      ctaLabel: 'Sign in',
      ctaUrl: `${this.frontendUrl}/login`,
    });

    try {
      await this.deliver(user.email, 'Your Vill Shop account has been restored', html);
    } catch (err) {
      this.logger.error(`Failed to send unban email to ${user.email}`, err);
    }
  }

  async sendLowStockAlert(productName: string, stock: number): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      this.logger.warn('ADMIN_EMAIL not set — skipping low stock alert');
      return;
    }

    const html = renderEmail('low-stock', {
      productName,
      stock: String(stock),
      title: `Low stock: ${productName}`,
      preheader: `${productName} has ${stock} units left`,
      eyebrow: 'Inventory alert',
      headline: 'Low stock warning',
      ctaLabel: 'Manage inventory',
      ctaUrl: `${this.frontendUrl}/admin/inventory`,
    });

    try {
      await this.deliver(adminEmail, `Low stock alert: ${productName}`, html);
    } catch (err) {
      this.logger.error('Failed to send low stock alert', err);
    }
  }
}

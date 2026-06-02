import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from './payment.entity';

export enum OrderState {
  PENDING = 'PENDING',
  AWAITING_PAYMENT = 'AWAITING_PAYMENT',
  PAID = 'PAID',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_number', unique: true })
  orderNumber: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: OrderState, default: OrderState.PENDING })
  state: OrderState;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total: number;

  @Column({ default: 'KES' })
  currency: string;

  @Column({ name: 'shipping_address', type: 'jsonb', nullable: true })
  shippingAddress: Record<string, string>;

  @Column({ name: 'tracking_number', nullable: true })
  trackingNumber: string;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @OneToOne(() => Payment, (p) => p.order)
  payment: Payment;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}

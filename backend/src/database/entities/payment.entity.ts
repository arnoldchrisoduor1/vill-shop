import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', unique: true })
  orderId: string;

  @OneToOne(() => Order, (o) => o.payment)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ default: 'pesapal' })
  provider: string;

  @Column({ name: 'provider_ref', nullable: true })
  providerRef: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ default: 'KES' })
  currency: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

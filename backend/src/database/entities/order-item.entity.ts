import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from './product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id' })
  orderId: string;

  @Column({ name: 'product_id', nullable: true })
  productId: string;

  @Column({ name: 'product_name' })
  productName: string;

  @Column({ name: 'product_sku' })
  productSku: string;

  @Column({ name: 'variant_name', nullable: true })
  variantName: string;

  @Column({ default: 1 })
  quantity: number;

  @Column({ name: 'price_kes', type: 'decimal', precision: 12, scale: 2 })
  priceKes: number;

  @Column({ name: 'price_display', type: 'decimal', precision: 12, scale: 2 })
  priceDisplay: number;

  @Column({ default: 'KES' })
  currency: string;

  @Column({ name: 'digital_file_key', nullable: true })
  digitalFileKey: string;

  @ManyToOne(() => Order, (o) => o.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Product, { nullable: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}

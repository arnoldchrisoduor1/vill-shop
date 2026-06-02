import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_media')
export class ProductMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id' })
  productId: string;

  @Column()
  key: string;

  @Column()
  url: string;

  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @ManyToOne(() => Product, (p) => p.media, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

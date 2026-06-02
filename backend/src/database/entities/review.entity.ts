import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'product_id' })
  productId: string;

  @Column()
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'varchar', nullable: true, name: 'image_key' })
  imageKey: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'image_url' })
  imageUrl: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Product, (p) => p.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

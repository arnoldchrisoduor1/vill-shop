import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';

@Entity('wishlists')
export class Wishlist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', unique: true })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToMany(() => Product)
  @JoinTable({
    name: 'wishlist_products',
    joinColumn: { name: 'wishlist_id' },
    inverseJoinColumn: { name: 'product_id' },
  })
  products: Product[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { Tag } from './tag.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductMedia } from './product-media.entity';
import { Review } from './review.entity';

export enum ProductType {
  PHYSICAL = 'physical',
  DIGITAL = 'digital',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: ProductType, default: ProductType.PHYSICAL })
  type: ProductType;

  @Column({ unique: true })
  sku: string;

  @Column({ default: 0 })
  stock: number;

  @Column({ name: 'price_kes', type: 'decimal', precision: 12, scale: 2 })
  priceKes: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'digital_file_key', nullable: true })
  digitalFileKey: string;

  @ManyToOne(() => Category, { nullable: true, eager: false })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'category_id', nullable: true })
  categoryId: string | null;

  @ManyToMany(() => Tag, (tag) => tag.products, { eager: false })
  @JoinTable({
    name: 'product_tag',
    joinColumn: { name: 'product_id' },
    inverseJoinColumn: { name: 'tag_id' },
  })
  tags: Tag[];

  @OneToMany(() => ProductVariant, (v) => v.product, { cascade: true })
  variants: ProductVariant[];

  @OneToMany(() => ProductMedia, (m) => m.product, { cascade: true })
  media: ProductMedia[];

  @OneToMany(() => Review, (r) => r.product)
  reviews: Review[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}

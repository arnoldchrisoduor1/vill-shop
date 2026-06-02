import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('hero_slides')
export class HeroSlide {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  headline: string;

  @Column({ nullable: true })
  subtext: string;

  @Column({ name: 'cta_label', nullable: true })
  ctaLabel: string;

  @Column({ name: 'cta_url', nullable: true })
  ctaUrl: string;

  @Column({ name: 'image_key', nullable: true })
  imageKey: string;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

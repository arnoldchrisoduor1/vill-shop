import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('events')
export class ShopEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'starts_at' })
  startsAt: Date;

  @Column({ name: 'ends_at' })
  endsAt: Date;

  @Column({ type: 'varchar', nullable: true })
  location: string | null;

  @Column({ default: false, name: 'is_published' })
  isPublished: boolean;

  @Column({ default: false, name: 'is_featured' })
  isFeatured: boolean;

  @Column({ type: 'varchar', nullable: true, name: 'cover_image_key' })
  coverImageKey: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'cover_image_url' })
  coverImageUrl: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}

export { ShopEvent as Event };

import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('feature_flags')
export class FeatureFlag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ name: 'is_enabled', default: false })
  isEnabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  value: Record<string, unknown>;

  @Column({ nullable: true })
  description: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('webhook_logs')
export class WebhookLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  provider: string;

  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  headers: Record<string, unknown>;

  @Column({ default: false })
  processed: boolean;

  @Column({ name: 'idempotency_key', nullable: true, unique: true })
  idempotencyKey: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

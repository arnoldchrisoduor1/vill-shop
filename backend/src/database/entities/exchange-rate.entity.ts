import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('exchange_rates')
export class ExchangeRate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  currency: string;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  rate: number;

  @Column({ name: 'fetched_at' })
  fetchedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

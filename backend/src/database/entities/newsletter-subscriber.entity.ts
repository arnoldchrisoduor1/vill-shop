import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('newsletter_subscribers')
export class NewsletterSubscriber {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'subscribed_at' })
  subscribedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

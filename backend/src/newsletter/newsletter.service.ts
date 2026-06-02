import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsletterSubscriber } from '../database/entities/newsletter-subscriber.entity';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(NewsletterSubscriber)
    private subscriberRepo: Repository<NewsletterSubscriber>,
  ) {}

  async subscribe(email: string): Promise<{ message: string }> {
    const existing = await this.subscriberRepo.findOne({ where: { email } });
    if (existing) {
      return { message: 'Already subscribed' };
    }

    await this.subscriberRepo.save(
      this.subscriberRepo.create({
        email,
        subscribedAt: new Date(),
      }),
    );

    return { message: 'Successfully subscribed' };
  }
}

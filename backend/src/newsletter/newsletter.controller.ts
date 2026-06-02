import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { IsEmail } from 'class-validator';
import { NewsletterService } from './newsletter.service';
import { Public } from '../common/decorators/public.decorator';

class SubscribeDto {
  @IsEmail()
  email!: string;
}

@Controller('api/v1/newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('subscribe')
  subscribe(@Body() dto: SubscribeDto) {
    return this.newsletterService.subscribe(dto.email);
  }
}

import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bull';
import { WebhookLog } from '../database/entities/webhook-log.entity';
import { PaymentsService } from '../payments/payments.service';

@Processor('webhooks')
export class ProcessWebhookProcessor {
  private readonly logger = new Logger(ProcessWebhookProcessor.name);

  constructor(
    @InjectRepository(WebhookLog)
    private webhookLogRepo: Repository<WebhookLog>,
    private paymentsService: PaymentsService,
  ) {}

  @Process('process-pesapal')
  async handle(
    job: Job<{ orderTrackingId: string; webhookLogId: string }>,
  ): Promise<void> {
    const { orderTrackingId, webhookLogId } = job.data;

    try {
      await this.paymentsService.verifyAndUpdatePayment(orderTrackingId);

      await this.webhookLogRepo.update(webhookLogId, { processed: true });
      this.logger.log(`Processed Pesapal webhook for tracking id: ${orderTrackingId}`);
    } catch (err) {
      this.logger.error(
        `Failed to process webhook for tracking id: ${orderTrackingId}`,
        err,
      );
      throw err;
    }
  }
}

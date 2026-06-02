import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bull';
import axios from 'axios';
import { ExchangeRate } from '../database/entities/exchange-rate.entity';

interface ExchangeRateApiResponse {
  result: string;
  rates: Record<string, number>;
}

@Processor('exchange-rates')
export class FetchExchangeRatesProcessor {
  private readonly logger = new Logger(FetchExchangeRatesProcessor.name);
  private readonly CURRENCIES = ['USD', 'EUR', 'GBP', 'UGX', 'TZS'];

  constructor(
    @InjectRepository(ExchangeRate)
    private exchangeRateRepo: Repository<ExchangeRate>,
  ) {}

  @Process('fetch-rates')
  async handle(_job: Job): Promise<void> {
    try {
      const response = await axios.get<ExchangeRateApiResponse>(
        'https://open.er-api.com/v6/latest/KES',
        { timeout: 10000 },
      );

      if (response.data.result !== 'success') {
        throw new Error('Exchange rate API returned non-success result');
      }

      const rates = response.data.rates;
      const fetchedAt = new Date();

      for (const currency of this.CURRENCIES) {
        const rate = rates[currency];
        if (!rate) continue;

        await this.exchangeRateRepo.save(
          this.exchangeRateRepo.create({
            currency,
            rate,
            fetchedAt,
          }),
        );
      }

      this.logger.log(
        `Exchange rates updated for: ${this.CURRENCIES.filter((c) => rates[c]).join(', ')}`,
      );
    } catch (err) {
      this.logger.error('Failed to fetch exchange rates', err);
      throw err;
    }
  }
}

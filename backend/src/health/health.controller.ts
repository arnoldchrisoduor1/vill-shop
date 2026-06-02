import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { Public } from '../common/decorators/public.decorator';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);
  private readonly redis: Redis;

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      lazyConnect: true,
    });
  }

  @Public()
  @Get()
  async check(): Promise<{
    status: string;
    db: string;
    redis: string;
    timestamp: string;
  }> {
    let dbStatus = 'ok';
    let redisStatus = 'ok';

    try {
      await this.dataSource.query('SELECT 1');
    } catch (err) {
      this.logger.error('Health check - DB failed', err);
      dbStatus = 'error';
    }

    try {
      await this.redis.ping();
    } catch (err) {
      this.logger.error('Health check - Redis failed', err);
      redisStatus = 'error';
    }

    const isHealthy = dbStatus === 'ok' && redisStatus === 'ok';
    const result = {
      status: isHealthy ? 'ok' : 'degraded',
      db: dbStatus,
      redis: redisStatus,
      timestamp: new Date().toISOString(),
    };

    if (!isHealthy) {
      throw new HttpException(result, HttpStatus.SERVICE_UNAVAILABLE);
    }

    return result;
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWebhookLogs1000000000003 implements MigrationInterface {
  name = 'CreateWebhookLogs1000000000003';

  async up(_queryRunner: QueryRunner): Promise<void> {
    // webhook_logs is created in CreateFeatureFlags1000000000002
  }

  async down(_queryRunner: QueryRunner): Promise<void> {
    // no-op — table lifecycle is managed by CreateFeatureFlags1000000000002
  }
}

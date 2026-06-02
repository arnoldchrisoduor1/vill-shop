import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateFeatureFlags1000000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'feature_flags',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'name', type: 'varchar', isUnique: true },
          { name: 'is_enabled', type: 'boolean', default: false },
          { name: 'value', type: 'jsonb', isNullable: true },
          { name: 'description', type: 'varchar', isNullable: true },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'webhook_logs',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'provider', type: 'varchar' },
          { name: 'payload', type: 'jsonb' },
          { name: 'headers', type: 'jsonb', isNullable: true },
          { name: 'processed', type: 'boolean', default: false },
          { name: 'idempotency_key', type: 'varchar', isNullable: true, isUnique: true },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('webhook_logs');
    await queryRunner.dropTable('feature_flags');
  }
}

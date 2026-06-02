import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReviewImage1000000000009 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "reviews"
      ADD COLUMN IF NOT EXISTS "image_key" character varying,
      ADD COLUMN IF NOT EXISTS "image_url" character varying
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "reviews"
      DROP COLUMN IF EXISTS "image_key",
      DROP COLUMN IF EXISTS "image_url"
    `);
  }
}

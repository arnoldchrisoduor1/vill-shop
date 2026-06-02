import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEventsAndSlides1000000000005 implements MigrationInterface {
  name = 'CreateEventsAndSlides1000000000005';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "events" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "description" text NOT NULL,
        "starts_at" TIMESTAMP NOT NULL,
        "ends_at" TIMESTAMP NOT NULL,
        "location" character varying,
        "is_published" boolean NOT NULL DEFAULT false,
        "is_featured" boolean NOT NULL DEFAULT false,
        "cover_image_key" character varying,
        "cover_image_url" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "UQ_events_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_events" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "hero_slides" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "headline" character varying NOT NULL,
        "subtext" character varying,
        "cta_label" character varying,
        "cta_url" character varying,
        "image_key" character varying,
        "image_url" character varying,
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_hero_slides" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "newsletter_subscribers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "subscribed_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_newsletter_subscribers_email" UNIQUE ("email"),
        CONSTRAINT "PK_newsletter_subscribers" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "exchange_rates" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "currency" character varying NOT NULL,
        "rate" numeric(20,8) NOT NULL,
        "fetched_at" TIMESTAMP NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_exchange_rates" PRIMARY KEY ("id")
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "exchange_rates"`);
    await queryRunner.query(`DROP TABLE "newsletter_subscribers"`);
    await queryRunner.query(`DROP TABLE "hero_slides"`);
    await queryRunner.query(`DROP TABLE "events"`);
  }
}

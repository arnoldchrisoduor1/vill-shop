import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCatalog1000000000004 implements MigrationInterface {
  name = 'CreateCatalog1000000000004';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "icon" character varying,
        "description" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_categories_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_categories" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "tags" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_tags_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_tags" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."products_type_enum" AS ENUM('physical', 'digital')
    `);

    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "description" text NOT NULL,
        "type" "public"."products_type_enum" NOT NULL,
        "sku" character varying NOT NULL,
        "stock" integer NOT NULL DEFAULT 0,
        "price_kes" numeric(12,2) NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "is_featured" boolean NOT NULL DEFAULT false,
        "digital_file_key" character varying,
        "category_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "UQ_products_slug" UNIQUE ("slug"),
        CONSTRAINT "UQ_products_sku" UNIQUE ("sku"),
        CONSTRAINT "PK_products" PRIMARY KEY ("id"),
        CONSTRAINT "FK_products_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "product_tag" (
        "product_id" uuid NOT NULL,
        "tag_id" uuid NOT NULL,
        CONSTRAINT "PK_product_tag" PRIMARY KEY ("product_id", "tag_id"),
        CONSTRAINT "FK_product_tag_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_product_tag_tag" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "product_variants" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "sku" character varying NOT NULL,
        "stock" integer NOT NULL DEFAULT 0,
        "price_kes" numeric(12,2) NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "product_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_product_variants_sku" UNIQUE ("sku"),
        CONSTRAINT "PK_product_variants" PRIMARY KEY ("id"),
        CONSTRAINT "FK_product_variants_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "product_media" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "product_id" uuid NOT NULL,
        "key" character varying NOT NULL,
        "url" character varying NOT NULL,
        "is_primary" boolean NOT NULL DEFAULT false,
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_product_media" PRIMARY KEY ("id"),
        CONSTRAINT "FK_product_media_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_products_name_trgm" ON "products"
      USING GIN ("name" gin_trgm_ops)
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_products_description_trgm" ON "products"
      USING GIN ("description" gin_trgm_ops)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_products_description_trgm"`);
    await queryRunner.query(`DROP INDEX "IDX_products_name_trgm"`);
    await queryRunner.query(`DROP TABLE "product_media"`);
    await queryRunner.query(`DROP TABLE "product_variants"`);
    await queryRunner.query(`DROP TABLE "product_tag"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TYPE "public"."products_type_enum"`);
    await queryRunner.query(`DROP TABLE "tags"`);
    await queryRunner.query(`DROP TABLE "categories"`);
  }
}

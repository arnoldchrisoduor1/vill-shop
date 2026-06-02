import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCart1000000000006 implements MigrationInterface {
  name = 'CreateCart1000000000006';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "carts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_carts_user_id" UNIQUE ("user_id"),
        CONSTRAINT "PK_carts" PRIMARY KEY ("id"),
        CONSTRAINT "FK_carts_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "cart_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "cart_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        "variant_id" uuid,
        "quantity" integer NOT NULL DEFAULT 1,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cart_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_cart_items_cart" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_cart_items_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_cart_items_variant" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "cart_items"`);
    await queryRunner.query(`DROP TABLE "carts"`);
  }
}

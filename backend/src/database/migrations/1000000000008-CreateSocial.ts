import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSocial1000000000008 implements MigrationInterface {
  name = 'CreateSocial1000000000008';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "reviews" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        "rating" integer NOT NULL,
        "comment" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reviews" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_reviews_user_product" UNIQUE ("user_id", "product_id"),
        CONSTRAINT "CHK_reviews_rating" CHECK ("rating" >= 1 AND "rating" <= 5),
        CONSTRAINT "FK_reviews_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_reviews_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "wishlists" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_wishlists_user_id" UNIQUE ("user_id"),
        CONSTRAINT "PK_wishlists" PRIMARY KEY ("id"),
        CONSTRAINT "FK_wishlists_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "wishlist_products" (
        "wishlist_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        CONSTRAINT "PK_wishlist_products" PRIMARY KEY ("wishlist_id", "product_id"),
        CONSTRAINT "FK_wishlist_products_wishlist" FOREIGN KEY ("wishlist_id") REFERENCES "wishlists"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_wishlist_products_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "wishlist_products"`);
    await queryRunner.query(`DROP TABLE "wishlists"`);
    await queryRunner.query(`DROP TABLE "reviews"`);
  }
}

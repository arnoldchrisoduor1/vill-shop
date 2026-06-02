import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrders1000000000007 implements MigrationInterface {
  name = 'CreateOrders1000000000007';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."orders_state_enum" AS ENUM(
        'PENDING', 'AWAITING_PAYMENT', 'PAID', 'PROCESSING',
        'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "order_number" character varying NOT NULL,
        "user_id" uuid NOT NULL,
        "state" "public"."orders_state_enum" NOT NULL DEFAULT 'PENDING',
        "subtotal" numeric(12,2) NOT NULL,
        "tax_amount" numeric(12,2) NOT NULL DEFAULT 0,
        "total" numeric(12,2) NOT NULL,
        "currency" character varying NOT NULL DEFAULT 'KES',
        "shipping_address" json,
        "tracking_number" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "UQ_orders_order_number" UNIQUE ("order_number"),
        CONSTRAINT "PK_orders" PRIMARY KEY ("id"),
        CONSTRAINT "FK_orders_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "order_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "order_id" uuid NOT NULL,
        "product_id" uuid,
        "product_name" character varying NOT NULL,
        "product_sku" character varying NOT NULL,
        "variant_name" character varying,
        "quantity" integer NOT NULL DEFAULT 1,
        "price_kes" numeric(12,2) NOT NULL,
        "price_display" numeric(12,2) NOT NULL,
        "currency" character varying NOT NULL DEFAULT 'KES',
        "digital_file_key" character varying,
        CONSTRAINT "PK_order_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_order_items_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_order_items_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."payments_status_enum" AS ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')
    `);

    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "order_id" uuid NOT NULL,
        "provider" character varying NOT NULL DEFAULT 'pesapal',
        "provider_ref" character varying,
        "status" "public"."payments_status_enum" NOT NULL DEFAULT 'PENDING',
        "amount" numeric(12,2) NOT NULL,
        "currency" character varying NOT NULL DEFAULT 'KES',
        "metadata" json,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_payments_order_id" UNIQUE ("order_id"),
        CONSTRAINT "PK_payments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_payments_order" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_orders_user_id" ON "orders" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_state" ON "orders" ("state")`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_created_at" ON "orders" ("created_at")`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_orders_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_orders_state"`);
    await queryRunner.query(`DROP INDEX "IDX_orders_user_id"`);
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TYPE "public"."orders_state_enum"`);
  }
}

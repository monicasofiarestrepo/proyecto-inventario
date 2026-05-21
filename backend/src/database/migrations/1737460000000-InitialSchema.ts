import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1737460000000 implements MigrationInterface {
  name = 'InitialSchema1737460000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('products')) {
      return;
    }

    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(
      `CREATE TYPE "public"."products_unitmeasure_enum" AS ENUM('unidades', 'kg', 'litros')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."movements_type_enum" AS ENUM('IN', 'OUT')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."movements_reason_enum" AS ENUM('compra', 'venta', 'ajuste', 'merma', 'devolución')`,
    );
    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" text NOT NULL DEFAULT '',
        "unitMeasure" "public"."products_unitmeasure_enum" NOT NULL,
        "category" character varying NOT NULL,
        "minStock" numeric(12,3) NOT NULL DEFAULT 0,
        "active" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_products" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "movements" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "productId" uuid NOT NULL,
        "type" "public"."movements_type_enum" NOT NULL,
        "quantity" numeric(12,3) NOT NULL DEFAULT 1,
        "reason" "public"."movements_reason_enum" NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_movements" PRIMARY KEY ("id"),
        CONSTRAINT "FK_movements_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "movements"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "products"`);
  }
}

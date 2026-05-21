import { MigrationInterface, QueryRunner } from 'typeorm';

export class SafeDecimalColumns1737460000001 implements MigrationInterface {
  name = 'SafeDecimalColumns1737460000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('products')) {
      const hasMinStock = await queryRunner.hasColumn('products', 'minStock');
      if (hasMinStock) {
        await queryRunner.query(
          `UPDATE "products" SET "minStock" = 0 WHERE "minStock" IS NULL`,
        );
        await queryRunner.query(
          `ALTER TABLE "products" ALTER COLUMN "minStock" TYPE numeric(12,3) USING "minStock"::numeric`,
        );
      }
    }

    if (!(await queryRunner.hasTable('movements'))) {
      return;
    }

    const hasQuantity = await queryRunner.hasColumn('movements', 'quantity');
    if (hasQuantity) {
      await queryRunner.query(
        `UPDATE "movements" SET "quantity" = 1 WHERE "quantity" IS NULL`,
      );
      await queryRunner.query(
        `ALTER TABLE "movements" ALTER COLUMN "quantity" TYPE numeric(12,3) USING "quantity"::numeric`,
      );
      await queryRunner.query(
        `ALTER TABLE "movements" ALTER COLUMN "quantity" SET NOT NULL`,
      );
    } else {
      await queryRunner.query(
        `ALTER TABLE "movements" ADD "quantity" numeric(12,3) NOT NULL DEFAULT 1`,
      );
    }
  }

  public async down(): Promise<void> {
    // Sin rollback en producción
  }
}

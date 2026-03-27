import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddQuotationNumber1711000000000 implements MigrationInterface {
  name = 'AddQuotationNumber1711000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create a sequence for the quotationNumber column
    await queryRunner.query(`
      CREATE SEQUENCE IF NOT EXISTS cost_estimator_quotationnumber_seq
    `);

    // Add the column using the sequence as its default
    await queryRunner.query(`
      ALTER TABLE "cost_estimator"
      ADD COLUMN IF NOT EXISTS "quotationNumber" INTEGER
        DEFAULT nextval('cost_estimator_quotationnumber_seq')
    `);

    // Make the sequence owned by the column so it is dropped together
    await queryRunner.query(`
      ALTER SEQUENCE cost_estimator_quotationnumber_seq
      OWNED BY "cost_estimator"."quotationNumber"
    `);

    // Backfill existing rows: leave them as NULL (nullable column)
    await queryRunner.query(`
      ALTER TABLE "cost_estimator"
      ALTER COLUMN "quotationNumber" DROP DEFAULT
    `);

    // Re-apply the default so new rows get auto-incremented values
    await queryRunner.query(`
      ALTER TABLE "cost_estimator"
      ALTER COLUMN "quotationNumber" SET DEFAULT nextval('cost_estimator_quotationnumber_seq')
    `);

    // Add a unique constraint
    await queryRunner.query(`
      ALTER TABLE "cost_estimator"
      ADD CONSTRAINT IF NOT EXISTS "UQ_cost_estimator_quotationNumber"
      UNIQUE ("quotationNumber")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "cost_estimator"
      DROP CONSTRAINT IF EXISTS "UQ_cost_estimator_quotationNumber"
    `);
    await queryRunner.query(`
      ALTER TABLE "cost_estimator"
      DROP COLUMN IF EXISTS "quotationNumber"
    `);
  }
}

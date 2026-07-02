/**
 * Invoice GST data migration — preserves legacy JSON items column.
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Client } from 'pg';

dotenv.config({
  path: path.resolve(
    process.cwd(),
    `.env.${process.env.NODE_ENV || 'development'}`,
  ),
});
dotenv.config();

const STEPS: { label: string; sql: string }[] = [
  {
    label: 'Backfill bill_to_mobile',
    sql: `UPDATE invoice_estimator
      SET bill_to_mobile = "customerMobile"
      WHERE bill_to_mobile IS NULL AND "customerMobile" IS NOT NULL`,
  },
  {
    label: 'Copy subTotal → grand_total / status defaults',
    sql: `UPDATE invoice_estimator
      SET
        subtotal = COALESCE(subtotal, 0),
        grand_total = CASE
          WHEN COALESCE(grand_total, 0) = 0 THEN COALESCE("subTotal", subtotal, 0)
          ELSE grand_total
        END,
        balance_due = CASE
          WHEN COALESCE(balance_due, 0) = 0 THEN COALESCE("subTotal", subtotal, 0)
          ELSE balance_due
        END,
        taxable_value = CASE
          WHEN COALESCE(taxable_value, 0) = 0 THEN COALESCE("subTotal", subtotal, 0)
          ELSE taxable_value
        END,
        status = COALESCE(status, 'paid'),
        invoice_type = COALESCE(invoice_type, 'interiors'),
        ship_to_same_as_bill = COALESCE(ship_to_same_as_bill, true)
      WHERE id IS NOT NULL`,
  },
  {
    label: 'Migrate JSON items → invoice_items',
    sql: `INSERT INTO invoice_items (
      id, invoice_id, sort_order, group_name, item_name, description, hsn_sac_code,
      pricing_mode, quantity, unit_label, unit_price, area_value, area_unit, rate_per_unit,
      gross_amount, item_discount_amount, taxable_amount, gst_rate, gst_amount,
      cgst_amount, sgst_amount, igst_amount, line_total, created_at, updated_at
    )
    SELECT
      gen_random_uuid(),
      inv.id,
      (row_number() OVER (PARTITION BY inv.id ORDER BY ordinality) - 1)::int,
      'General',
      COALESCE(item->>'item_name', 'Item'),
      item->>'description',
      NULL,
      CASE WHEN COALESCE((item->>'area')::numeric, 1) > 1 THEN 'area' ELSE 'unit' END,
      CASE WHEN COALESCE((item->>'area')::numeric, 1) > 1 THEN NULL
           ELSE COALESCE((item->>'quantity')::numeric, 1) END,
      CASE WHEN COALESCE((item->>'area')::numeric, 1) <= 1 THEN 'nos' ELSE NULL END,
      CASE WHEN COALESCE((item->>'area')::numeric, 1) <= 1
           THEN COALESCE((item->>'price')::numeric, 0) ELSE NULL END,
      CASE WHEN COALESCE((item->>'area')::numeric, 1) > 1
           THEN COALESCE((item->>'area')::numeric, 1) ELSE NULL END,
      CASE WHEN COALESCE((item->>'area')::numeric, 1) > 1 THEN 'sqft' ELSE NULL END,
      CASE WHEN COALESCE((item->>'area')::numeric, 1) > 1
           THEN COALESCE((item->>'price')::numeric, 0) ELSE NULL END,
      CASE WHEN COALESCE((item->>'area')::numeric, 1) > 1
        THEN ROUND(COALESCE((item->>'area')::numeric, 1) * COALESCE((item->>'price')::numeric, 0), 2)
        ELSE ROUND(COALESCE((item->>'quantity')::numeric, 1) * COALESCE((item->>'price')::numeric, 0), 2)
      END,
      0,
      CASE WHEN COALESCE((item->>'area')::numeric, 1) > 1
        THEN ROUND(COALESCE((item->>'area')::numeric, 1) * COALESCE((item->>'price')::numeric, 0), 2)
        ELSE ROUND(COALESCE((item->>'quantity')::numeric, 1) * COALESCE((item->>'price')::numeric, 0), 2)
      END,
      0, 0, 0, 0, 0,
      CASE WHEN COALESCE((item->>'area')::numeric, 1) > 1
        THEN ROUND(COALESCE((item->>'area')::numeric, 1) * COALESCE((item->>'price')::numeric, 0), 2)
        ELSE ROUND(COALESCE((item->>'quantity')::numeric, 1) * COALESCE((item->>'price')::numeric, 0), 2)
      END,
      NOW(), NOW()
    FROM invoice_estimator inv
    CROSS JOIN LATERAL jsonb_array_elements(COALESCE(inv.items, '[]'::jsonb))
      WITH ORDINALITY AS t(item, ordinality)
    WHERE inv.items IS NOT NULL
      AND jsonb_array_length(inv.items) > 0
      AND NOT EXISTS (SELECT 1 FROM invoice_items ii WHERE ii.invoice_id = inv.id)`,
  },
  {
    label: 'Default supplier snapshot',
    sql: `UPDATE invoice_estimator
      SET
        supplier_name = COALESCE(NULLIF(supplier_name, ''), 'Houznext Interiors Pvt Ltd'),
        supplier_state = COALESCE(NULLIF(supplier_state, ''), 'Telangana'),
        supplier_state_code = COALESCE(NULLIF(supplier_state_code, ''), '36')
      WHERE supplier_name IS NULL OR supplier_name = ''`,
  },
];

async function run() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const before = await client.query(
    'SELECT COUNT(*)::int AS c FROM invoice_estimator',
  );
  console.log(`Invoices in DB: ${before.rows[0].c}`);

  const tableCheck = await client.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_name = 'invoice_items'
    ) AS ok
  `);
  if (!tableCheck.rows[0].ok) {
    console.error(
      'invoice_items table missing — start the API once (TypeORM sync) then re-run.',
    );
    await client.end();
    process.exit(1);
  }

  for (const step of STEPS) {
    console.log(`\n→ ${step.label}`);
    const res = await client.query(step.sql);
    console.log(`  affected rows: ${res.rowCount ?? 0}`);
  }

  const itemCount = await client.query(
    'SELECT COUNT(*)::int AS c FROM invoice_items',
  );
  const unmigrated = await client.query(`
    SELECT COUNT(*)::int AS c FROM invoice_estimator inv
    WHERE inv.items IS NOT NULL AND jsonb_array_length(inv.items) > 0
      AND NOT EXISTS (SELECT 1 FROM invoice_items ii WHERE ii.invoice_id = inv.id)
  `);
  const drift = await client.query(`
    SELECT COUNT(*)::int AS c FROM invoice_estimator inv
    WHERE COALESCE(inv."subTotal", inv.subtotal, 0) > 0
      AND ABS(COALESCE(inv.grand_total, 0) - COALESCE(inv."subTotal", inv.subtotal, 0)) > 1
  `);

  console.log('\n=== Verification ===');
  console.log(`invoice_items rows: ${itemCount.rows[0].c}`);
  console.log(`Unmigrated invoices: ${unmigrated.rows[0].c} (expect 0)`);
  console.log(`Total drift > ₹1: ${drift.rows[0].c} (expect 0)`);
  console.log('Legacy items JSON column: KEPT (not dropped)');

  await client.end();
  console.log('\nDone.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

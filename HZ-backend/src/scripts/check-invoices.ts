import * as dotenv from 'dotenv';
import * as path from 'path';
import { Client } from 'pg';

dotenv.config({ path: path.resolve(process.cwd(), '.env.development') });

async function run() {
  const c = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await c.connect();
  const r = await c.query(
    `SELECT id, "invoiceNumber", branch_id, invoice_type, status, grand_total, created_at FROM invoice_estimator`,
  );
  console.table(r.rows);
  await c.end();
}
run();

/**
 * Copy all infra_* table data from OLD_DATABASE_URL → NEW_DATABASE_URL.
 * Old DB is read-only. Does not delete anything on the source.
 *
 * Usage:
 *   OLD_DATABASE_URL=postgresql://...shortline... \
 *   NEW_DATABASE_URL=postgresql://...new-railway... \
 *   npx ts-node -r tsconfig-paths/register src/scripts/migrate-infra-db.ts
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Client } from 'pg';

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env.migration') });
dotenv.config({
  path: path.resolve(__dirname, '..', '..', `.env.${process.env.NODE_ENV || 'development'}`),
});

const OLD_URL = process.env.OLD_DATABASE_URL?.trim();
const NEW_URL = process.env.NEW_DATABASE_URL?.trim();

if (!OLD_URL) {
  console.error('Missing OLD_DATABASE_URL (shared HZ/infra source database).');
  process.exit(1);
}

if (!NEW_URL) {
  console.error('Missing NEW_DATABASE_URL (new dedicated Infra Postgres public URL).');
  process.exit(1);
}

if (OLD_URL === NEW_URL) {
  console.error('OLD_DATABASE_URL and NEW_DATABASE_URL must be different.');
  process.exit(1);
}

async function listInfraTables(client: Client): Promise<string[]> {
  const res = await client.query<{ table_name: string }>(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      AND table_name LIKE 'infra_%'
    ORDER BY table_name
  `);
  return res.rows.map((r) => r.table_name);
}

async function countRows(client: Client, table: string): Promise<number> {
  const res = await client.query<{ c: string }>(`SELECT COUNT(*)::text AS c FROM "${table}"`);
  return Number(res.rows[0]?.c ?? 0);
}

async function copyTable(oldDb: Client, newDb: Client, table: string): Promise<number> {
  const { rows } = await oldDb.query(`SELECT * FROM "${table}"`);
  if (!rows.length) return 0;

  const columns = Object.keys(rows[0]);
  const colList = columns.map((c) => `"${c}"`).join(', ');
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

  await newDb.query('BEGIN');
  try {
    await newDb.query(`DELETE FROM "${table}"`);
    for (const row of rows) {
      const values = columns.map((c) => row[c]);
      await newDb.query(
        `INSERT INTO "${table}" (${colList}) VALUES (${placeholders})`,
        values,
      );
    }
    await newDb.query('COMMIT');
  } catch (e) {
    await newDb.query('ROLLBACK');
    throw e;
  }

  return rows.length;
}

async function resetSequences(client: Client, tables: string[]): Promise<void> {
  for (const table of tables) {
    const res = await client.query<{ column_name: string; pg_get_serial_sequence: string }>(
      `
      SELECT a.attname AS column_name,
             pg_get_serial_sequence('"' || t.relname || '"', a.attname) AS pg_get_serial_sequence
      FROM pg_class t
      JOIN pg_attribute a ON a.attrelid = t.oid
      WHERE t.relname = $1
        AND a.attnum > 0
        AND NOT a.attisdropped
        AND pg_get_serial_sequence('"' || t.relname || '"', a.attname) IS NOT NULL
    `,
      [table],
    );
    for (const row of res.rows) {
      const seq = row.pg_get_serial_sequence;
      if (!seq) continue;
      await client.query(`
        SELECT setval(
          '${seq.replace(/'/g, "''")}',
          COALESCE((SELECT MAX("${row.column_name}") FROM "${table}"), 1),
          true
        )
      `);
    }
  }
}

async function main() {
  const oldDb = new Client({ connectionString: OLD_URL, ssl: { rejectUnauthorized: false } });
  const newDb = new Client({ connectionString: NEW_URL, ssl: { rejectUnauthorized: false } });

  console.log('Connecting to OLD (source) database…');
  await oldDb.connect();
  console.log('Connecting to NEW (target) database…');
  await newDb.connect();

  const oldTables = await listInfraTables(oldDb);
  const newTables = await listInfraTables(newDb);

  if (!oldTables.length) {
    console.error('No infra_* tables found on OLD database.');
    process.exit(1);
  }
  if (!newTables.length) {
    console.error('No infra_* tables on NEW database. Run backend once with TYPEORM_SYNC=true first.');
    process.exit(1);
  }

  const missingOnNew = oldTables.filter((t) => !newTables.includes(t));
  if (missingOnNew.length) {
    console.warn('Tables on OLD but missing on NEW (skipped):', missingOnNew.join(', '));
  }

  const tables = oldTables.filter((t) => newTables.includes(t));
  console.log(`Migrating ${tables.length} infra_* tables…\n`);

  await newDb.query('SET session_replication_role = replica');

  const summary: { table: string; rows: number }[] = [];
  try {
    for (const table of tables) {
      const before = await countRows(oldDb, table);
      if (before === 0) {
        console.log(`  ${table}: 0 rows (skip)`);
        summary.push({ table, rows: 0 });
        continue;
      }
      const copied = await copyTable(oldDb, newDb, table);
      console.log(`  ${table}: ${copied} rows`);
      summary.push({ table, rows: copied });
    }
  } finally {
    await newDb.query('SET session_replication_role = DEFAULT');
  }

  console.log('\nResetting sequences on NEW database…');
  await resetSequences(newDb, tables);

  console.log('\nVerification (OLD vs NEW row counts):');
  let ok = true;
  for (const table of tables) {
    const oldCount = await countRows(oldDb, table);
    const newCount = await countRows(newDb, table);
    const match = oldCount === newCount ? 'OK' : 'MISMATCH';
    if (oldCount !== newCount) ok = false;
    console.log(`  ${table}: ${oldCount} → ${newCount} [${match}]`);
  }

  const total = summary.reduce((s, x) => s + x.rows, 0);
  console.log(`\nDone. Copied ${total} rows total. Source database was not modified.`);

  await oldDb.end();
  await newDb.end();

  if (!ok) {
    console.error('\nSome tables did not match — review output above.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

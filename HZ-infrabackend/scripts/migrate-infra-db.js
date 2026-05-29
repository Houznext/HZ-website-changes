/**
 * Copy all infra_* table data from OLD_DATABASE_URL → NEW_DATABASE_URL.
 * Old DB is read-only. Does not delete anything on the source.
 *
 * From your PC: NEW_DATABASE_URL must be DATABASE_PUBLIC_URL (*.proxy.rlwy.net).
 * From Railway shell: NEW can be postgres.railway.internal.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env.migration') });

const { Client } = require('pg');

const OLD_URL = process.env.OLD_DATABASE_URL?.trim();
const NEW_URL = process.env.NEW_DATABASE_URL?.trim();

if (!OLD_URL) {
  console.error('Missing OLD_DATABASE_URL.');
  process.exit(1);
}
if (!NEW_URL) {
  console.error('Missing NEW_DATABASE_URL.');
  process.exit(1);
}
if (OLD_URL === NEW_URL) {
  console.error('OLD and NEW database URLs must differ.');
  process.exit(1);
}

async function listInfraTables(client) {
  const res = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name LIKE 'infra_%'
    ORDER BY table_name
  `);
  return res.rows.map((r) => r.table_name);
}

async function countRows(client, table) {
  const res = await client.query(`SELECT COUNT(*)::text AS c FROM "${table}"`);
  return Number(res.rows[0]?.c ?? 0);
}

async function copyTable(oldDb, newDb, table) {
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
      await newDb.query(`INSERT INTO "${table}" (${colList}) VALUES (${placeholders})`, values);
    }
    await newDb.query('COMMIT');
  } catch (e) {
    await newDb.query('ROLLBACK');
    throw e;
  }
  return rows.length;
}

async function resetSequences(client, tables) {
  for (const table of tables) {
    const res = await client.query(
      `
      SELECT a.attname AS column_name,
             pg_get_serial_sequence('"' || t.relname || '"', a.attname) AS seq
      FROM pg_class t
      JOIN pg_attribute a ON a.attrelid = t.oid
      WHERE t.relname = $1 AND a.attnum > 0 AND NOT a.attisdropped
        AND pg_get_serial_sequence('"' || t.relname || '"', a.attname) IS NOT NULL
    `,
      [table],
    );
    for (const row of res.rows) {
      if (!row.seq) continue;
      await client.query(
        `SELECT setval($1::regclass, COALESCE((SELECT MAX("${row.column_name}") FROM "${table}"), 1), true)`,
        [row.seq],
      );
    }
  }
}

async function main() {
  const ssl = { rejectUnauthorized: false };
  const oldDb = new Client({ connectionString: OLD_URL, ssl });
  const newDb = new Client({ connectionString: NEW_URL, ssl });

  console.log('Connecting to OLD (source)…');
  await oldDb.connect();
  console.log('Connecting to NEW (target)…');
  await newDb.connect();

  const oldTables = await listInfraTables(oldDb);
  const newTables = await listInfraTables(newDb);

  if (!oldTables.length) {
    console.error('No infra_* tables on OLD database.');
    process.exit(1);
  }
  if (!newTables.length) {
    console.error('No infra_* tables on NEW. Run backend with TYPEORM_SYNC=true first.');
    process.exit(1);
  }

  const missingOnNew = oldTables.filter((t) => !newTables.includes(t));
  if (missingOnNew.length) {
    console.warn('On OLD but not NEW (skipped):', missingOnNew.join(', '));
  }

  const tables = oldTables.filter((t) => newTables.includes(t));
  console.log(`Migrating ${tables.length} tables…\n`);

  await newDb.query('SET session_replication_role = replica');
  let total = 0;
  try {
    for (const table of tables) {
      const before = await countRows(oldDb, table);
      if (before === 0) {
        console.log(`  ${table}: 0 rows (skip)`);
        continue;
      }
      const copied = await copyTable(oldDb, newDb, table);
      total += copied;
      console.log(`  ${table}: ${copied} rows`);
    }
  } finally {
    await newDb.query('SET session_replication_role = DEFAULT');
  }

  console.log('\nResetting sequences…');
  await resetSequences(newDb, tables);

  console.log('\nVerification (OLD → NEW):');
  let ok = true;
  for (const table of tables) {
    const o = await countRows(oldDb, table);
    const n = await countRows(newDb, table);
    const status = o === n ? 'OK' : 'MISMATCH';
    if (o !== n) ok = false;
    console.log(`  ${table}: ${o} → ${n} [${status}]`);
  }

  console.log(`\nDone. ${total} rows copied. Source DB unchanged.`);
  await oldDb.end();
  await newDb.end();
  if (!ok) process.exit(1);
}

main().catch((err) => {
  if (String(err.message).includes('ENOTFOUND') && NEW_URL.includes('railway.internal')) {
    console.error(
      '\nCannot reach postgres.railway.internal from your PC.\n' +
        'Use DATABASE_PUBLIC_URL from Railway → Postgres → Connect (host *.proxy.rlwy.net),\n' +
        'OR run this script in Railway → backend service → Shell:\n' +
        '  npm run migrate:infra-db',
    );
  } else {
    console.error('Migration failed:', err.message);
  }
  process.exit(1);
});

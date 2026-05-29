const { Client } = require('pg');
const url =
  process.env.OLD_DATABASE_URL ||
  'postgresql://postgres:ppTdWRWXNALEgdmAEFbNLumkwbFQUAsD@shortline.proxy.rlwy.net:25681/railway';

(async () => {
  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const r = await c.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name LIKE 'infra_%'
    ORDER BY 1
  `);
  console.log('infra tables:', r.rows.length);
  for (const row of r.rows) {
    const n = await c.query(`SELECT COUNT(*)::int AS c FROM "${row.table_name}"`);
    console.log(`  ${row.table_name}: ${n.rows[0].c}`);
  }
  await c.end();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

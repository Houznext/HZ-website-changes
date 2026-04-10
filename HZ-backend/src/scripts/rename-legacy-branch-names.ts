/**
 * Replace legacy root branch display names with "Houznext" in the `branch` table.
 * Set MIGRATE_LEGACY_BRANCH_REGEX to a PostgreSQL regex that matches names to rewrite.
 * Run: npm run rename:legacy-branch
 */
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({
  path: path.resolve(
    process.cwd(),
    `.env.${process.env.NODE_ENV || 'development'}`,
  ),
});
dotenv.config();

import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../../db/datasource';

async function run() {
  const pattern = process.env.MIGRATE_LEGACY_BRANCH_REGEX?.trim();
  if (!pattern) {
    console.error(
      'Set MIGRATE_LEGACY_BRANCH_REGEX in .env to a PostgreSQL regex for branch names to replace.',
    );
    process.exit(1);
  }

  const safe = pattern.replace(/'/g, "''");

  const ds = new DataSource({
    ...dataSourceOptions,
    entities: [],
    migrations: [],
    synchronize: false,
  });

  await ds.initialize();

  try {
    const result = await ds.query(
      `UPDATE branch
       SET name = REGEXP_REPLACE(name, '${safe}', 'Houznext', 'gi')
       WHERE name ~* '${safe}'
       RETURNING id, name`,
    );

    const rows = Array.isArray(result) ? result : [result];
    if (rows.length === 0) {
      console.log('No branch names matched the regex. Nothing updated.');
    } else {
      console.log(`Updated ${rows.length} branch name(s) to Houznext:`);
      rows.forEach((r: { id: string; name: string }) =>
        console.log(`  - ${r.id}: "${r.name}"`),
      );
    }
  } finally {
    await ds.destroy();
  }

  process.exit(0);
}

run().catch((err) => {
  console.error('Rename script failed:', err);
  process.exit(1);
});

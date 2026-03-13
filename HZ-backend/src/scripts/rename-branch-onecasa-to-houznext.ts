/**
 * Safely update branch names: replace "OneCasa" with "Houznext" so the
 * Settings > User Management card and any branch labels show Houznext.
 * Run: npm run rename:branch-houznext
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
  const ds = new DataSource({
    ...dataSourceOptions,
    entities: [],
    migrations: [],
    synchronize: false,
  });

  await ds.initialize();

  try {
    // Update branch.name: replace OneCasa (and common variants) with Houznext
    const result = await ds.query(
      `UPDATE branch
       SET name = REGEXP_REPLACE(name, 'One\\s*Casa|onecasa', 'Houznext', 'gi')
       WHERE name ~* 'One\\s*Casa|onecasa'
       RETURNING id, name`,
    );

    const rows = Array.isArray(result) ? result : [result];
    if (rows.length === 0) {
      console.log('No branch names contained "OneCasa" (or "onecasa"). Nothing updated.');
    } else {
      console.log(`Updated ${rows.length} branch name(s) from OneCasa to Houznext:`);
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

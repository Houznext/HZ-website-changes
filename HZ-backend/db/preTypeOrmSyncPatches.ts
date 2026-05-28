import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { DataSource } from 'typeorm';

/** Resolve SQL from dist/db/migrations or project-root db/migrations (nest start:dev). */
function readMigrationSql(filename: string): string {
  const candidates = [
    join(__dirname, 'migrations', filename),
    join(process.cwd(), 'db', 'migrations', filename),
    join(__dirname, '..', 'db', 'migrations', filename),
    join(__dirname, '..', '..', 'db', 'migrations', filename),
  ];
  for (const path of candidates) {
    if (existsSync(path)) {
      return readFileSync(path, 'utf8');
    }
  }
  throw new Error(
    `Migration file not found: ${filename} (checked ${candidates.join(', ')})`,
  );
}

/**
 * TypeORM `synchronize` can fail when altering `crm_lead_status_log.status`
 * (e.g. enum → varchar NOT NULL) if historical rows have NULL.
 * Run these fixes once per connection before the main DataSource syncs.
 */
export async function runPreTypeOrmSynchronizePatches(
  url: string | undefined,
): Promise<void> {
  if (!url?.trim()) return;

  const ds = new DataSource({
    type: 'postgres',
    url,
    ssl: { rejectUnauthorized: false },
    synchronize: false,
    logging: false,
  });

  try {
    await ds.initialize();

    // Destructive: only when explicitly requested (never on normal restarts).
    if (process.env.LIVEBUILD_PURGE_ON_START === 'true') {
      try {
        const purgeSql = readMigrationSql('20260521000000-livebuild-purge.sql');
        await ds.query(purgeSql);
        console.log('[pre-sync] LiveBuild tables purged (LIVEBUILD_PURGE_ON_START=true)');
      } catch (purgeErr) {
        const purgeMsg = purgeErr instanceof Error ? purgeErr.message : String(purgeErr);
        console.warn(`[pre-sync] LiveBuild purge failed (non-fatal): ${purgeMsg}`);
      }
    }

    try {
      const schemaSql = readMigrationSql('20260521100000-livebuild-schema.sql');
      await ds.query(schemaSql);
      console.log('[pre-sync] LiveBuild schema ensured (CREATE IF NOT EXISTS)');
    } catch (schemaErr) {
      const schemaMsg = schemaErr instanceof Error ? schemaErr.message : String(schemaErr);
      console.warn(`[pre-sync] LiveBuild schema skipped (non-fatal): ${schemaMsg}`);
    }

    try {
      const paymentsFkSql = readMigrationSql('20260522100000-livebuild-payments-fk.sql');
      await ds.query(paymentsFkSql);
      console.log('[pre-sync] LiveBuild payments FK verified');
    } catch (fkErr) {
      const fkMsg = fkErr instanceof Error ? fkErr.message : String(fkErr);
      console.warn(`[pre-sync] LiveBuild payments FK patch skipped (non-fatal): ${fkMsg}`);
    }

    await ds.query(
      `UPDATE crm_lead_status_log SET status = $1 WHERE status IS NULL`,
      ['New'],
    );
    await ds.query(
      `UPDATE crm SET leadstatus = $1 WHERE leadstatus IS NULL`,
      ['New'],
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn(`[pre-sync] Database patch skipped (non-fatal): ${msg}`);
  } finally {
    if (ds.isInitialized) {
      await ds.destroy();
    }
  }
}

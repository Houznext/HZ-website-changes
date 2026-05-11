import { DataSource } from 'typeorm';

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

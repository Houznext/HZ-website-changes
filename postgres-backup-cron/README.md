# PostgreSQL backup cron (Railway → S3)

Standalone Railway service that runs `pg_dump`, uploads a gzip SQL file to your existing S3 bucket, and prunes backups older than the last 8.

## Files

| File | Purpose |
|------|---------|
| `backup.sh` | Dump, upload, retention, logging |
| `Dockerfile` | `postgres:15-alpine` + `aws-cli` |
| `railway.toml` / `railway.json` | Cron schedule + Docker deploy |

## Cron schedule (exact line)

```cron
0 2 */7 * *
```

- **Meaning:** At **02:00 UTC** on days **1, 8, 15, 22, and 29** of each month (`*/7` in the day-of-month field).
- Railway runs schedules in **UTC** only.
- Configured in `railway.toml` as:

```toml
cronSchedule = "0 2 */7 * *"
```

> **Note:** Standard cron does not mean “every 168 hours from last run.” If you need a strict 7-day interval from first deploy, use Railway’s UI to adjust or consider `0 2 * * 0` (weekly Sundays 02:00 UTC) instead.

## Required environment variables

Set these on the **cron service** (reference from Postgres + backend/S3 service in Railway):

| Variable | Used for |
|----------|----------|
| `DATABASE_URL` | `pg_dump` connection string |
| `AWS_ACCESS_KEY_ID` | S3 upload / list / delete |
| `AWS_SECRET_ACCESS_KEY` | S3 upload / list / delete |
| `S3_BUCKET_NAME` | Target bucket |
| `AWS_REGION` | AWS CLI region |

Optional:

| Variable | Default | Purpose |
|----------|---------|---------|
| `BACKUP_KEEP_COUNT` | `8` | Number of `.sql.gz` files to retain |
| `BACKUP_S3_PREFIX` | `backups/postgres` | S3 key prefix |

## S3 object key pattern

```
backups/postgres/{YYYY-MM-DD}.sql.gz
```

Example: `s3://houznext-prod-assets/backups/postgres/2026-05-31.sql.gz`

## Add as a new Railway service

1. **Push this folder** in your repo (`postgres-backup-cron/` at the monorepo root).

2. In your **existing Railway project** → **+ New** → **Empty Service** (or **GitHub Repo** if not linked).

3. **Service settings → Source**
   - Connect the same GitHub repo.
   - Set **Root Directory** to: `postgres-backup-cron`

4. **Settings → Deploy**
   - Confirm **Cron Schedule** shows: `0 2 */7 * *` (from `railway.toml` after deploy).
   - **Start command** should be `/usr/local/bin/backup.sh` (from config).

5. **Variables** → add references (recommended):
   - `DATABASE_URL` → Reference → your Railway **PostgreSQL** plugin or backend service variable.
   - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`, `AWS_REGION` → Reference → backend/infra service that already uploads to S3.

6. **Deploy** once manually to verify logs show:
   ```
   SUCCESS: uploaded backups/postgres/YYYY-MM-DD.sql.gz (… bytes)
   ```

7. Ensure the IAM user for `AWS_ACCESS_KEY_ID` can:
   - `s3:PutObject` on `arn:aws:s3:::BUCKET/backups/postgres/*`
   - `s3:ListBucket` on `arn:aws:s3:::BUCKET` with prefix `backups/postgres/`
   - `s3:DeleteObject` on old keys under that prefix

## Local test (optional)

```bash
cd postgres-backup-cron
docker build -t pg-backup-cron .
docker run --rm \
  -e DATABASE_URL="postgresql://..." \
  -e AWS_ACCESS_KEY_ID="..." \
  -e AWS_SECRET_ACCESS_KEY="..." \
  -e S3_BUCKET_NAME="..." \
  -e AWS_REGION="ap-south-1" \
  pg-backup-cron
```

## Logs

- **Success:** UTC timestamp, S3 key, compressed file size.
- **Failure:** UTC timestamp + `ERROR:` for missing env, `pg_dump`, upload, or retention delete.

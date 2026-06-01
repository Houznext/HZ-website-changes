#!/usr/bin/env bash
# Full PostgreSQL backup → S3 (gzip). Intended for Railway cron (run once and exit).
set -euo pipefail

log() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*"
}

log_err() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] ERROR: $*" >&2
}

on_fail() {
  local code=$?
  log_err "Backup failed with exit code ${code}"
  exit "${code}"
}

trap on_fail ERR

require_var() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    log_err "Missing required environment variable: ${name}"
    exit 1
  fi
}

require_var DATABASE_URL
require_var AWS_ACCESS_KEY_ID
require_var AWS_SECRET_ACCESS_KEY
require_var S3_BUCKET_NAME
require_var AWS_REGION

export AWS_DEFAULT_REGION="${AWS_REGION}"
export PGPASSWORD="" # prefer credentials inside DATABASE_URL

KEEP_COUNT="${BACKUP_KEEP_COUNT:-8}"
S3_PREFIX="${BACKUP_S3_PREFIX:-backups/postgres}"
DATE_UTC="$(date -u +%Y-%m-%d)"
OBJECT_KEY="${S3_PREFIX}/${DATE_UTC}.sql.gz"
TMP_FILE=""

cleanup() {
  if [[ -n "${TMP_FILE}" && -f "${TMP_FILE}" ]]; then
    rm -f "${TMP_FILE}"
  fi
}
trap cleanup EXIT

log "Starting PostgreSQL backup (UTC date: ${DATE_UTC})"

TMP_FILE="$(mktemp /tmp/pg-backup.XXXXXX.sql.gz)"
log "Running pg_dump → gzip (${TMP_FILE})"

if ! pg_dump "${DATABASE_URL}" --no-owner --no-acl 2>&1 | gzip -c > "${TMP_FILE}"; then
  log_err "pg_dump failed"
  exit 1
fi

FILE_SIZE="$(wc -c < "${TMP_FILE}" | tr -d ' ')"
if [[ "${FILE_SIZE}" -lt 1 ]]; then
  log_err "Backup file is empty after pg_dump"
  exit 1
fi

log "Dump complete (${FILE_SIZE} bytes compressed)"

S3_URI="s3://${S3_BUCKET_NAME}/${OBJECT_KEY}"
log "Uploading to ${S3_URI}"

if ! aws s3 cp "${TMP_FILE}" "${S3_URI}" --only-show-errors; then
  log_err "S3 upload failed for ${S3_URI}"
  exit 1
fi

log "SUCCESS: uploaded ${OBJECT_KEY} (${FILE_SIZE} bytes) to bucket ${S3_BUCKET_NAME}"

log "Applying retention policy (keep last ${KEEP_COUNT} backups under ${S3_PREFIX}/)"

LIST_URI="s3://${S3_BUCKET_NAME}/${S3_PREFIX}/"
# shellcheck disable=SC2207
mapfile -t OBJECT_NAMES < <(
  aws s3 ls "${LIST_URI}" 2>/dev/null \
    | awk '{print $4}' \
    | grep -E '^[0-9]{4}-[0-9]{2}-[0-9]{2}\.sql\.gz$' \
    | sort
)

TOTAL="${#OBJECT_NAMES[@]}"
if [[ "${TOTAL}" -le "${KEEP_COUNT}" ]]; then
  log "Retention: ${TOTAL} backup(s) present, nothing to delete (limit ${KEEP_COUNT})"
else
  DELETE_COUNT=$((TOTAL - KEEP_COUNT))
  log "Retention: deleting ${DELETE_COUNT} oldest backup(s)"
  for ((i = 0; i < DELETE_COUNT; i++)); do
    OLD_KEY="${S3_PREFIX}/${OBJECT_NAMES[$i]}"
    if aws s3 rm "s3://${S3_BUCKET_NAME}/${OLD_KEY}" --only-show-errors; then
      log "Deleted old backup: ${OLD_KEY}"
    else
      log_err "Failed to delete ${OLD_KEY}"
      exit 1
    fi
  done
fi

log "Backup job finished successfully"

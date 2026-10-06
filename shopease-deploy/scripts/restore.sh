#!/usr/bin/env bash
# Restores a dump into an EMPTY database:  ./scripts/restore.sh backups/shopease-2026XXXX.sql.gz
# (stop the api first:  docker compose stop api   and recreate the db volume if it already has tables)
set -euo pipefail
cd "$(dirname "$0")/.."
[ $# -eq 1 ] || { echo "usage: $0 <backup.sql.gz>"; exit 1; }
gunzip -c "$1" | docker compose exec -T db psql -U shopease -d shopease
echo "Restore finished. Start the api again:  docker compose start api"

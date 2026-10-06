#!/usr/bin/env bash
# Dumps the database to backups/ (gzip) and deletes dumps older than 14 days.
# Run it from anywhere:  ./scripts/backup.sh     (schedule it with cron, see DEPLOYMENT.md)
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p backups
FILE="backups/shopease-$(date +%Y%m%d-%H%M%S).sql.gz"
docker compose exec -T db pg_dump -U shopease --no-owner shopease | gzip > "$FILE"
echo "Saved $FILE ($(du -h "$FILE" | cut -f1))"
find backups -name 'shopease-*.sql.gz' -mtime +14 -delete

#!/usr/bin/env bash
# =============================================================================
# QuantShine — Postgres gecelik yedek (EC2-yerel)
# Kurulum: /opt/quantshine/backup-postgres.sh olarak kopyala, chmod +x,
#          root crontab'a ekle:  0 0 * * * /opt/quantshine/backup-postgres.sh \
#                                  >> /opt/quantshine/backups/backup.log 2>&1
# (00:00 UTC = 03:00 Europe/Istanbul)
#
# pg_dumpall ile TÜM veritabanları + roller alınır, gzip'lenir, RETENTION_DAYS
# günden eski yedekler silinir. Çıktı: /opt/quantshine/backups/
#
# NOT: Yedekler EC2 ile aynı diskte → kazara silme / uygulama hatası / container
# yeniden oluşturmaya karşı korur, AMA EC2/disk kaybına karşı KORUMAZ. Dayanıklı
# koruma için S3 offsite (IAM role + aws cli) ileride eklenmeli — aşağıdaki
# S3 bloğunu açın.
# =============================================================================
set -euo pipefail

BACKUP_DIR=/opt/quantshine/backups
RETENTION_DAYS=14
CONTAINER=quantshine-postgres

mkdir -p "$BACKUP_DIR"
TS=$(date -u +%Y%m%d-%H%M%S)
OUT="$BACKUP_DIR/quantshine-${TS}.sql.gz"

# Konteyner içinde pg_dumpall (POSTGRES_USER konteyner env'inden gelir, yerel
# soket → şifre gerekmez). pipefail sayesinde dump hatası yakalanır.
docker exec "$CONTAINER" sh -c 'pg_dumpall -U "$POSTGRES_USER"' | gzip > "$OUT"

# Boş/bozuk yedeği reddet
if [ ! -s "$OUT" ] || ! gzip -t "$OUT" 2>/dev/null; then
  echo "$(date -u) HATA: yedek boş veya bozuk, siliniyor: $OUT" >&2
  rm -f "$OUT"
  exit 1
fi

# Eski yedekleri temizle
find "$BACKUP_DIR" -name 'quantshine-*.sql.gz' -mtime +"$RETENTION_DAYS" -delete

echo "$(date -u) OK $OUT ($(du -h "$OUT" | cut -f1))"

# --- S3 offsite (ileride; IAM role/keys + aws cli kurulunca aç) ---------------
# BUCKET=s3://quantshine-db-backups
# aws s3 cp "$OUT" "$BUCKET/" --storage-class STANDARD_IA
# -----------------------------------------------------------------------------

#!/bin/bash
# QuantShine Production Deploy Script
# Kullanım: ./deploy.sh [frontend|backend|all]
# Varsayılan: all (hem frontend hem backend günceller)

set -euo pipefail  # Hata, ayarsız değişken ve pipe hataları için dur

TARGET=${1:-all}
DEPLOY_DIR="/opt/quantshine"
COMPOSE_FILE="docker-compose.prod.yml"
TRUSTED_REMOTE="git@github.com:quantshine"   # Güvenilen uzak repo prefix'i
LOG_FILE="/var/log/quantshine-deploy.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# ── Yardımcı Fonksiyonlar ─────────────────────────────────────────────
log() {
  echo "[$TIMESTAMP] $*" | tee -a "$LOG_FILE"
}

die() {
  log "HATA: $*"
  exit 1
}

# ── Ön Kontroller ─────────────────────────────────────────────────────
[[ "$(id -u)" -ne 0 ]] && die "Deploy scripti root veya sudo ile çalıştırılmalıdır."
[[ -d "$DEPLOY_DIR" ]] || die "Deploy dizini bulunamadı: $DEPLOY_DIR"
command -v docker &>/dev/null || die "Docker kurulu değil."

log "========================================="
log " QuantShine Deploy Başlıyor → [$TARGET]"
log "========================================="

cd "$DEPLOY_DIR" || die "Deploy dizinine geçilemedi."

# ── Frontend ──────────────────────────────────────────────────────────
if [[ "$TARGET" == "frontend" || "$TARGET" == "all" ]]; then
  log ""
  log "▶ Frontend güncelleniyor..."

  cd frontend || die "frontend dizinine geçilemedi."

  # Uzak origin güven kontrolü
  REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
  if [[ "$REMOTE_URL" != "$TRUSTED_REMOTE"* ]]; then
    die "Güvenilmeyen git remote: $REMOTE_URL"
  fi

  # Kaydedilmemiş değişiklik var mı?
  if ! git diff --quiet HEAD; then
    log "UYARI: Kaydedilmemiş değişiklikler var. Stash yapılıyor..."
    git stash push -m "deploy-otomatik-stash-$TIMESTAMP"
  fi

  # Güncel kodu çek
  git fetch origin main 2>&1 | tee -a "$LOG_FILE"
  git reset --hard origin/main 2>&1 | tee -a "$LOG_FILE"

  cd ..

  # Docker build
  docker compose -f "$COMPOSE_FILE" up -d --build frontend 2>&1 | tee -a "$LOG_FILE"
  log "✔ Frontend başarıyla güncellendi."
fi

# ── Backend ───────────────────────────────────────────────────────────
if [[ "$TARGET" == "backend" || "$TARGET" == "all" ]]; then
  log ""
  log "▶ Backend güncelleniyor..."

  cd quantshine_capital || die "quantshine_capital dizinine geçilemedi."

  REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
  if [[ "$REMOTE_URL" != "$TRUSTED_REMOTE"* ]]; then
    die "Güvenilmeyen git remote: $REMOTE_URL"
  fi

  if ! git diff --quiet HEAD; then
    log "UYARI: Kaydedilmemiş değişiklikler var. Stash yapılıyor..."
    git stash push -m "deploy-otomatik-stash-$TIMESTAMP"
  fi

  git fetch origin master 2>&1 | tee -a "$LOG_FILE"
  git reset --hard origin/master 2>&1 | tee -a "$LOG_FILE"

  cd ..

  docker compose -f "$COMPOSE_FILE" up -d --build backend 2>&1 | tee -a "$LOG_FILE"
  log "✔ Backend başarıyla güncellendi."
fi

# ── Nginx yeniden başlat ──────────────────────────────────────────────
log ""
log "▶ Nginx yeniden başlatılıyor..."
docker compose -f "$COMPOSE_FILE" restart nginx 2>&1 | tee -a "$LOG_FILE"
log "✔ Nginx yeniden başlatıldı."

# ── Servis Sağlık Kontrolü ───────────────────────────────────────────
log ""
log "▶ Servisler kontrol ediliyor..."
sleep 5
UNHEALTHY=$(docker compose -f "$COMPOSE_FILE" ps --format json 2>/dev/null | \
  python3 -c "import sys,json; data=sys.stdin.read(); items=json.loads(data) if data.startswith('[') else [json.loads(l) for l in data.splitlines() if l]; print('\n'.join(i['Name'] for i in items if 'unhealthy' in i.get('Health','').lower()))" 2>/dev/null || echo "")

if [[ -n "$UNHEALTHY" ]]; then
  log "UYARI: Unhealthy servisler: $UNHEALTHY"
fi

# ── Durum Raporu ─────────────────────────────────────────────────────
log ""
log "========================================="
log " Servis Durumları:"
log "========================================="
docker compose -f "$COMPOSE_FILE" ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" | tee -a "$LOG_FILE"

log ""
log "✅ Deploy tamamlandı! [$TIMESTAMP]"

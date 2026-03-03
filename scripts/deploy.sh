#!/bin/bash
# QuantShine Production Deploy Script
# Kullanım: ./deploy.sh [frontend|backend|all]
# Varsayılan: all (hem frontend hem backend günceller)

set -e  # Herhangi bir hata olursa dur

TARGET=${1:-all}
DEPLOY_DIR="/opt/quantshine"
COMPOSE_FILE="docker-compose.prod.yml"

echo "========================================="
echo " QuantShine Deploy Başlıyor → [$TARGET]"
echo "========================================="

cd "$DEPLOY_DIR"

# ── Frontend ──────────────────────────────────
if [[ "$TARGET" == "frontend" || "$TARGET" == "all" ]]; then
  echo ""
  echo "▶ Frontend güncelleniyor..."
  cd frontend
  git stash
  git pull origin main
  cd ..
  docker compose -f "$COMPOSE_FILE" up -d --build frontend
  echo "✔ Frontend başarıyla güncellendi."
fi

# ── Backend ───────────────────────────────────
if [[ "$TARGET" == "backend" || "$TARGET" == "all" ]]; then
  echo ""
  echo "▶ Backend güncelleniyor..."
  cd quantshine_capital
  git stash
  git pull origin master
  cd ..
  docker compose -f "$COMPOSE_FILE" up -d --build backend
  echo "✔ Backend başarıyla güncellendi."
fi

# ── Nginx yeniden başlat ──────────────────────
echo ""
echo "▶ Nginx yeniden başlatılıyor..."
docker compose -f "$COMPOSE_FILE" restart nginx
echo "✔ Nginx yeniden başlatıldı."

# ── Durum raporu ─────────────────────────────
echo ""
echo "========================================="
echo " Servis Durumları:"
echo "========================================="
docker compose -f "$COMPOSE_FILE" ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "✅ Deploy tamamlandı!"

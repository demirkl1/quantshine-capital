#!/usr/bin/env bash
# Mac (veya herhangi bir dev makinede) backend + frontend image'larını
# build'leyip Docker Hub'a push eder. EC2 sadece docker pull yapıyor.
#
# Önkoşullar:
#   - docker login yapılmış (docker login)
#   - Frontend repo: bu script'in bir üstündeki dizin (quantshine-capital)
#   - Backend repo: $BACKEND_DIR (default /tmp/qs-backend, yoksa clone'lanır)
#
# Kullanım:
#   cd deploy/
#   ./build-push.sh
#
# Opsiyonel env değişkenleri:
#   DOCKER_HUB_USER=ddemirkl1  (Docker Hub username)
#   DOMAIN=quant-shine.com      (frontend build-arg için)
#   TAG=latest                  (image tag)
#   BACKEND_DIR=/tmp/qs-backend  (backend klonu konumu)

set -euo pipefail

DOCKER_HUB_USER=${DOCKER_HUB_USER:-ddemirkl1}
DOMAIN=${DOMAIN:-quant-shine.com}
TAG=${TAG:-latest}
BACKEND_REPO="https://github.com/demirkl1/quantshine_capital_backend.git"
BACKEND_DIR=${BACKEND_DIR:-/tmp/qs-backend}

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "▶ Docker Hub user: $DOCKER_HUB_USER"
echo "▶ Frontend repo:   $FRONTEND_DIR"
echo "▶ Backend repo:    $BACKEND_DIR"

# ── Backend hazır mı ──────────────────────────────────────────────────────────
if [[ ! -d "$BACKEND_DIR/.git" ]]; then
  echo "▶ Backend repo bulunamadı, clone'lanıyor → $BACKEND_DIR"
  git clone "$BACKEND_REPO" "$BACKEND_DIR"
else
  echo "▶ Backend repo güncelleniyor..."
  git -C "$BACKEND_DIR" fetch origin main
  git -C "$BACKEND_DIR" reset --hard origin/main
fi

# ── Frontend güncel mi (bilgilendirme) ────────────────────────────────────────
echo "▶ Frontend son commit: $(git -C "$FRONTEND_DIR" log -1 --oneline)"

# ── Build + push backend (amd64 — EC2 mimarisi) ───────────────────────────────
echo ""
echo "▶▶ Backend build + push ($DOCKER_HUB_USER/quantshine-backend:$TAG)"
docker buildx build \
  --platform linux/amd64 \
  -t "$DOCKER_HUB_USER/quantshine-backend:$TAG" \
  --push \
  "$BACKEND_DIR"

# ── Build + push frontend ─────────────────────────────────────────────────────
echo ""
echo "▶▶ Frontend build + push ($DOCKER_HUB_USER/quantshine-frontend:$TAG)"
docker buildx build \
  --platform linux/amd64 \
  --build-arg REACT_APP_API_BASE_URL=/api \
  --build-arg REACT_APP_KEYCLOAK_URL="https://$DOMAIN/auth" \
  --build-arg REACT_APP_KEYCLOAK_REALM=quantshine \
  --build-arg REACT_APP_KEYCLOAK_CLIENT_ID=quantshine-backend \
  -t "$DOCKER_HUB_USER/quantshine-frontend:$TAG" \
  --push \
  "$FRONTEND_DIR"

echo ""
echo "✅ İki image da Docker Hub'da:"
echo "   docker pull $DOCKER_HUB_USER/quantshine-backend:$TAG"
echo "   docker pull $DOCKER_HUB_USER/quantshine-frontend:$TAG"
echo ""
echo "Şimdi EC2'de:"
echo "   cd /opt/quantshine"
echo "   sudo docker compose -f docker-compose.prod.yml pull"
echo "   sudo docker compose -f docker-compose.prod.yml up -d"

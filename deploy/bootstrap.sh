#!/usr/bin/env bash
# Yeni Ubuntu 24.04 EC2 instance'ında tek komut kurulum.
# Kullanım: sudo ./bootstrap.sh
#
# Yaptığı:
#   1. Sistem update
#   2. Docker + Docker Compose kurar
#   3. /opt/quantshine dizinini oluşturur
#   4. Frontend + backend repolarını clone'lar
#   5. deploy/ içindekileri /opt/quantshine/ üstüne kopyalar
#   6. Kullanıcıya .env doldurtur, sonra init-letsencrypt.sh çağrılır

set -euo pipefail

[[ "$(id -u)" -ne 0 ]] && { echo "Root gerekli. sudo ile çalıştır."; exit 1; }

DEPLOY_DIR="/opt/quantshine"
FRONTEND_REPO="https://github.com/demirkl1/quantshine-capital.git"
BACKEND_REPO="https://github.com/demirkl1/quantshine_capital_backend.git"

echo "▶ Sistem paketleri güncelleniyor..."
apt-get update -q
apt-get install -y -q ca-certificates curl gnupg git

echo "▶ Docker kuruluyor..."
if ! command -v docker &>/dev/null; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
    https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -q
  apt-get install -y -q docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
fi

echo "▶ Deploy dizini hazırlanıyor: $DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"
cd "$DEPLOY_DIR"

echo "▶ Frontend repo clone'lanıyor..."
if [[ ! -d quantshine-capital ]]; then
  git clone "$FRONTEND_REPO"
else
  git -C quantshine-capital fetch origin main && git -C quantshine-capital reset --hard origin/main
fi

echo "▶ Backend repo clone'lanıyor..."
if [[ ! -d quantshine_capital_backend ]]; then
  git clone "$BACKEND_REPO"
else
  git -C quantshine_capital_backend fetch origin main && git -C quantshine_capital_backend reset --hard origin/main
fi

echo "▶ IaC dosyaları yerleştiriliyor..."
# `.env.example` gizli dosya — `*` glob gizli dosyaları atlar; `/.` trailing ile hepsi kopyalanır
cp -a quantshine-capital/deploy/. "$DEPLOY_DIR/"

if [[ ! -f "$DEPLOY_DIR/.env" ]]; then
  cp "$DEPLOY_DIR/.env.example" "$DEPLOY_DIR/.env"
  echo ""
  echo "⚠️  /opt/quantshine/.env oluşturuldu. Şimdi bu dosyayı düzenle:"
  echo "    sudo nano /opt/quantshine/.env"
  echo ""
  echo "Doldurman gerekenler: DOMAIN, LETSENCRYPT_EMAIL, POSTGRES_PASSWORD,"
  echo "KEYCLOAK_ADMIN_PASSWORD, ENCRYPTION_SECRET, ENCRYPTION_SALT, FINNHUB_API_KEY."
  echo ""
  echo "Doldurunca sırayla çalıştır:"
  echo "    cd /opt/quantshine"
  echo "    docker compose -f docker-compose.prod.yml up -d postgres keycloak backend frontend"
  echo "    sudo ./init-letsencrypt.sh      # DNS A kaydı IP'ye yönlendikten sonra"
  exit 0
fi

echo "✅ Bootstrap tamamlandı. .env zaten var, stack'i sen başlat:"
echo "    cd $DEPLOY_DIR && docker compose -f docker-compose.prod.yml up -d"

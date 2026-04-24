#!/usr/bin/env bash
# İlk kurulum: domain için Let's Encrypt sertifikası al.
# Sertifika yoksa nginx ayağa kalkamıyor → önce dummy cert üret, sonra gerçek cert'le replace et.
#
# Kullanım: ./init-letsencrypt.sh
# Gereksinim: .env dosyası aynı dizinde, DOMAIN ve LETSENCRYPT_EMAIL doldurulmuş olmalı.

set -euo pipefail

cd "$(dirname "$0")"

if [[ ! -f .env ]]; then
  echo "HATA: .env bulunamadı. .env.example dosyasını kopyalayıp doldur."
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

: "${DOMAIN:?DOMAIN boş olamaz}"
: "${LETSENCRYPT_EMAIL:?LETSENCRYPT_EMAIL boş olamaz}"

COMPOSE="docker compose -f docker-compose.prod.yml"
STAGING=${LETSENCRYPT_STAGING:-0}   # 1 = test sertifikası (rate-limit'e takılmaz)

echo "▶ Dummy sertifika üretiliyor ($DOMAIN) — nginx ilk başlangıçta hata vermesin diye..."
$COMPOSE run --rm --entrypoint "\
  sh -c 'mkdir -p /etc/letsencrypt/live/$DOMAIN && \
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
      -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem \
      -out    /etc/letsencrypt/live/$DOMAIN/fullchain.pem \
      -subj   \"/CN=localhost\"'" certbot

echo "▶ nginx başlatılıyor..."
$COMPOSE up -d nginx

echo "▶ Dummy sertifika siliniyor..."
$COMPOSE run --rm --entrypoint "\
  sh -c 'rm -rf /etc/letsencrypt/live/$DOMAIN /etc/letsencrypt/archive/$DOMAIN /etc/letsencrypt/renewal/$DOMAIN.conf'" certbot

echo "▶ Gerçek Let's Encrypt sertifikası alınıyor..."
STAGING_FLAG=""
[[ "$STAGING" == "1" ]] && STAGING_FLAG="--staging"

$COMPOSE run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $STAGING_FLAG \
    --email $LETSENCRYPT_EMAIL \
    -d $DOMAIN \
    --rsa-key-size 2048 \
    --agree-tos \
    --non-interactive \
    --force-renewal" certbot

echo "▶ nginx reload..."
$COMPOSE exec nginx nginx -s reload

echo ""
echo "✅ TLS kuruldu. https://$DOMAIN üzerinden eriş."

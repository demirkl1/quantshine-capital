#!/usr/bin/env bash
# t3.micro'da 1 GB RAM yetmez — 2 GB swap ekler ki postgres + keycloak + backend
# birlikte OOM olmadan çalışsın.
# Bu script EC2'de bir kez çalıştırılır.

set -euo pipefail

[[ "$(id -u)" -ne 0 ]] && { echo "Root gerekli. sudo ile çalıştır."; exit 1; }

SWAP_SIZE="2G"
SWAP_FILE="/swapfile"

if swapon --show | grep -q "$SWAP_FILE"; then
  echo "✔ Swap zaten aktif:"
  swapon --show
  exit 0
fi

echo "▶ $SWAP_SIZE swap dosyası oluşturuluyor..."
fallocate -l "$SWAP_SIZE" "$SWAP_FILE"
chmod 600 "$SWAP_FILE"
mkswap "$SWAP_FILE"
swapon "$SWAP_FILE"

# Reboot'ta otomatik aktifleşsin
if ! grep -q "$SWAP_FILE" /etc/fstab; then
  echo "$SWAP_FILE none swap sw 0 0" >> /etc/fstab
fi

# Swap'a geçişi geciktir (RAM önce dolsun)
sysctl vm.swappiness=10
grep -q "^vm.swappiness" /etc/sysctl.conf || echo "vm.swappiness=10" >> /etc/sysctl.conf

echo ""
echo "✅ Swap aktif:"
swapon --show
free -h

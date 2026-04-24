# QuantShine Production Deploy

Yeni AWS EC2 instance'ında sıfırdan kurulum. Tüm IaC bu klasörde — server'da elle dosya oluşturma yok.

## Mimari

Tek EC2 içinde 6 container:

```
┌────────────────────────────────────────────────────────┐
│                  EC2 (Ubuntu 24.04)                    │
│                                                        │
│   nginx ─┬─→ frontend (React SPA)                      │
│   :80    ├─→ backend  (Spring Boot 4, Java 21)  ─┐     │
│   :443   └─→ keycloak (22.0.0)                  ─┤     │
│                                                  ↓     │
│                                            postgres:16 │
│                                      (quantshine_db +  │
│                                        keycloak_db)    │
│   certbot (cert renewal)                               │
└────────────────────────────────────────────────────────┘
            ↑
     quantshinecapital.com (A record → EC2 IP)
```

## AWS EC2 açma

1. **Region**: eu-north-1 (Stockholm)
2. **AMI**: Ubuntu Server 24.04 LTS (amd64)
3. **Instance type**: `t3.medium` minimum (2 vCPU / 4 GB RAM). Build süresi için `t3.large` daha rahat.
4. **Storage**: 30 GB gp3 (Docker layer + Postgres data için)
5. **Security Group** inbound kuralları:
   - 22 (SSH) — sadece senin IP'n
   - 80 (HTTP) — 0.0.0.0/0 (Let's Encrypt için şart)
   - 443 (HTTPS) — 0.0.0.0/0
6. **Elastic IP** tahsis et ve instance'a attach et (IP sabit kalsın, DNS bağlayınca kaymasın).

## DNS ayarı

Domain registrar'ında (GoDaddy/Namecheap/vb.) **A record**:

| Type | Host | Value (EC2 Elastic IP) | TTL |
|------|------|------------------------|-----|
| A    | @    | 1.2.3.4                | 300 |
| A    | www  | 1.2.3.4                | 300 |

Yayılmayı bekle (`dig quantshinecapital.com +short` ile kontrol — birkaç dakika).

## Sunucuda kurulum

SSH ile gir, sonra:

```bash
# 1. Bootstrap repo'yu çek ve docker kur
cd /tmp
git clone https://github.com/demirkl1/quantshine-capital.git
sudo bash quantshine-capital/deploy/bootstrap.sh

# 2. .env'yi doldur
sudo nano /opt/quantshine/.env
# DOMAIN=quantshinecapital.com
# LETSENCRYPT_EMAIL=senin@email.com
# POSTGRES_PASSWORD=$(openssl rand -base64 32)
# ... (diğerleri için .env.example'a bak)

# 3. Stack'i ayağa kaldır (nginx hariç — henüz cert yok)
cd /opt/quantshine
sudo docker compose -f docker-compose.prod.yml up -d postgres keycloak backend frontend

# 4. DNS yayıldıktan sonra TLS kur
sudo ./init-letsencrypt.sh

# 5. Hazır. Site: https://quantshinecapital.com
```

## Güncelleme (deploy)

Kodda değişiklik olunca:

```bash
cd /opt/quantshine
sudo docker compose -f docker-compose.prod.yml pull   # sadece imaj güncellemeleri varsa
sudo bash quantshine-capital/scripts/deploy.sh        # git pull + rebuild
```

## Keycloak ilk kurulum

`init-letsencrypt.sh` bitince:

1. `https://quantshinecapital.com/auth/admin` → KEYCLOAK_ADMIN / KEYCLOAK_ADMIN_PASSWORD ile gir
2. Realm oluştur: `quantshine` (.env'deki KEYCLOAK_REALM ile aynı)
3. Client oluştur: `quantshine-backend`
   - Client authentication: Off (public)
   - Direct access grants: On
   - Valid redirect URIs: `https://quantshinecapital.com/*`
   - Web origins: `https://quantshinecapital.com`
4. Kullanıcı ekle → Credentials sekmesinde şifre ata

## Log/debug

```bash
# Container durumları
sudo docker compose -f /opt/quantshine/docker-compose.prod.yml ps

# Canlı loglar
sudo docker compose -f /opt/quantshine/docker-compose.prod.yml logs -f backend
sudo docker compose -f /opt/quantshine/docker-compose.prod.yml logs -f nginx
```

## Dosya envanteri

```
deploy/
├── docker-compose.prod.yml        Tüm stack
├── .env.example                    Secret şablonu
├── bootstrap.sh                    İlk kurulum (Docker + clone)
├── init-letsencrypt.sh             TLS sertifikası al
├── nginx/
│   └── default.conf.template      Reverse proxy (TLS, /api, /auth, SPA)
├── postgres/
│   └── init.sql                    Keycloak + uygulama DB'lerini oluşturur
└── README.md                       Bu dosya
```

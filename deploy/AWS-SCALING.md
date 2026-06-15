# QuantShine Capital — Ölçeklenebilir Mimari Planı

"Milyonlara hitap" hedefi için tek-EC2 kurulumundan dağıtık, yönetilen ve
otomatik ölçeklenen bir mimariye geçiş yol haritası. Repo içinde yapılabilecekler
(SEO, CI/CD, performans) tamamlandı; bu doküman **AWS konsolunda** yapılacak
altyapı adımlarını kapsar.

---

## 1. Mevcut Durum (tek EC2)

```
quant-shine.com (A → Elastic IP)
        │
   [ t3.micro EC2 ]
   nginx ─┬─ frontend (nginx+React, Docker)
   :80    ├─ backend  (Spring Boot, Docker)
   :443   ├─ keycloak (Docker)
          └─ postgres (Docker, aynı makinede)
```

**Darboğazlar:** Tek nokta arıza; CDN yok (her istek EC2'ye); DB konteynerde
(yedek/ölçek zor); dikey ölçek sınırı; TLS/trafik tek nginx'te. Birkaç yüz
eşzamanlı kullanıcıda zorlanır.

---

## 2. Hedef Mimari (yüksek ölçek)

```
                   Route 53 (DNS)
                        │
                   CloudFront (CDN, global edge, TLS, WAF)
                        │
        ┌───────────────┼───────────────────────────┐
   S3 (statik SPA)   ALB (Application Load Balancer)
   build/ dosyaları      │
                    ┌─────┴───────┐
              ECS Fargate     ECS Fargate
              backend x N     keycloak x M     (Auto Scaling)
                    │              │
              RDS PostgreSQL   ElastiCache (Redis)
              (Multi-AZ)       (cache + session)
```

### Bileşenler
| Katman | Servis | Neden |
|---|---|---|
| DNS | Route 53 | Sağlık kontrollü, hızlı |
| CDN | **CloudFront** | Statik içerik global edge'den; EC2 yükü %80+ düşer; TLS sonlandırma |
| Statik | **S3** (frontend build) | SPA dosyaları; sınırsız ölçek, ucuz |
| Yük dengeleme | **ALB** | Backend/Keycloak'a dağıtım, sağlık kontrolü |
| Uygulama | **ECS Fargate** (veya EKS) | Backend & Keycloak'ı sunucusuz konteyner; otomatik ölçek |
| Veritabanı | **RDS PostgreSQL (Multi-AZ)** | Yönetilen, yedekli, otomatik failover |
| Önbellek | **ElastiCache (Redis)** | API cache, oran sınırlama, oturum |
| Güvenlik | **WAF + Shield** | DDoS/bot/SQLi koruması |
| Gözlem | **CloudWatch + Sentry** | Log, metrik, alarm, hata takibi |
| Gizli | **Secrets Manager / SSM** | DB şifresi, API anahtarları |

---

## 3. Geçiş Adımları (kademeli, kesintisiz)

### Aşama A — CDN + Statik Frontend (en yüksek etki, en düşük risk)
1. S3 bucket oluştur (`quantshine-frontend-prod`), statik web hosting kapalı (CloudFront OAC ile).
2. CloudFront dağıtımı: origin = S3 (SPA), `/api/*` ve `/auth/*` davranışları origin = EC2/ALB.
3. ACM'de `quant-shine.com` için sertifika (us-east-1 — CloudFront şartı).
4. Route 53'te `quant-shine.com` → CloudFront.
5. Frontend deploy'u S3 sync + CloudFront invalidation'a çevir.
   > Not: `.github/workflows/deploy-frontend.yml` şu an Docker/EC2 modunda.
   > S3+CloudFront'a geçince eski S3 tabanlı workflow mantığına dönülür
   > (git geçmişinde mevcut) — SPA caching kuralları zaten hazır.
6. SPA için CloudFront "custom error response": 403/404 → `/index.html` (200).

### Aşama B — Yönetilen Veritabanı
1. RDS PostgreSQL (Multi-AZ, gp3) oluştur; `quantshine_database` + `keycloak_database`.
2. Mevcut konteyner Postgres'ten `pg_dump` → RDS'e `pg_restore`.
3. Backend `DB_URL`'i RDS endpoint'ine çevir; konteyner Postgres'i kaldır.
4. Otomatik yedek (7-30 gün) + snapshot.

### Aşama C — Uygulama Katmanı Ölçeği
1. Backend & Keycloak image'larını ECR'a push.
2. ECS Fargate servisleri (backend ≥2 task, keycloak ≥2 task) + ALB target group.
3. Auto Scaling: CPU/istek bazlı (örn. CPU %60 → ölçek).
4. Keycloak'ı cluster modunda (RDS + paylaşılan cache) çalıştır.
5. ALB'yi CloudFront `/api` ve `/auth` davranışlarına origin yap.

### Aşama D — Önbellek & Dayanıklılık
1. ElastiCache Redis: backend GET cache + login rate-limit + Keycloak oturum.
2. WAF kuralları (rate-based, AWS managed rule sets) CloudFront'a.
3. CloudWatch alarmları (5xx, gecikme, CPU, DB bağlantısı) + SNS bildirimi.
4. Frontend'e Sentry (zaten env-gated eklenebilir) + backend'e Micrometer/CloudWatch.

---

## 4. Tahmini Aylık Maliyet (kabaca, eu-north-1)
| Aşama | Servisler | ~USD/ay |
|---|---|---|
| A | S3 + CloudFront (düşük-orta trafik) | 5 – 30 |
| B | RDS db.t4g.small Multi-AZ | 60 – 90 |
| C | ECS Fargate (2-4 task) + ALB | 60 – 150 |
| D | ElastiCache t4g.small + WAF | 40 – 80 |

Düşük trafikte Aşama A tek başına bile büyük hız/dayanıklılık kazandırır; B-D
trafik arttıkça devreye alınır. "Önce A, sonra ihtiyaç oldukça B→C→D" önerilir.

---

## 5. Hızlı Kazanımlar (repo'da tamamlandı ✅)
- SEO: meta/OG/Twitter, `sitemap.xml`, `robots.txt`, JSON-LD, react-helmet (sayfa başına başlık).
- Performans: nginx gzip + hash'li asset'lerde 1 yıl immutable cache.
- CI/CD: main'e push → otomatik image build + EC2 deploy (GitHub Actions).
- Güvenlik başlıkları + CSP (nginx).

## 6. Sıradaki kod-tarafı işler (opsiyonel)
- **SSR/SSG**: pazarlama sayfaları için Next.js'e geçiş → en güçlü SEO + ilk yükleme hızı (büyük iş).
- **Görsel optimizasyon**: WebP/AVIF, responsive `srcset`, lazy-load.
- **Sentry**: `@sentry/react` env-gated entegrasyon.
- **Web Vitals bütçesi** + Lighthouse CI.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  ShieldCheck,
  Users,
  Zap,
  ArrowRight,
} from "lucide-react";
import MarketTicker from "../components/MarketTicker";
import MarketChart from "../components/MarketChart";
import NewsSection from "../components/NewsSection";
import FeaturedFunds from "../components/FeaturedFunds";
import Reveal from "../components/Reveal";
import CountUp from "../components/CountUp";
import "./LandingPage.css";

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Sürdürülebilir Getiri",
    text: "Yıllık %18.5 ortalama performans ile varlıklarınızı güvenle büyütün.",
  },
  {
    icon: ShieldCheck,
    title: "Yüksek Güvenlik",
    text: "Uçtan uca şifreleme ve global standartlarda varlık koruma altyapısı.",
  },
  {
    icon: Users,
    title: "Uzman Portföy",
    text: "1250+ bireysel ve kurumsal yatırımcıya özel stratejik yönetim.",
  },
  {
    icon: Zap,
    title: "Anlık İşlem",
    text: "Hızlı, şeffaf ve her cihazdan erişilebilir portföy takip arayüzü.",
  },
];

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="landing-page-container">
      {/* 1. ÜST BANT */}
      <div className="ticker-fixed-wrapper">
        <MarketTicker />
      </div>

      {/* 2. HERO — gradient + animasyon */}
      <section className="hero-section">
        <div className="hero-bg-layer">
          <div className="hero-grid" />
          <div className="hero-orb hero-orb--1" />
          <div className="hero-orb hero-orb--2" />
        </div>

        <div className="hero-foreground">
          <Reveal variant="up">
            <h1 className="hero-main-title">Geleceğin Finansına Hoş Geldiniz</h1>
          </Reveal>
          <Reveal variant="up" delay={120}>
            <p className="hero-sub-text">
              QuantShine Capital ile varlıklarınızı akıllıca yönetin.
            </p>
          </Reveal>
          <Reveal variant="up" delay={200} className="hero-cta-group">
            <Link to="/portfoy-bireysel" className="cta-button">
              Portföy Yönetimi <ArrowRight size={18} />
            </Link>
            <Link to="/fonlarimiz" className="cta-button cta-button--ghost">
              Fonlarımızı İnceleyin
            </Link>
          </Reveal>
        </div>

        <div className={`hero-scroll-indicator ${scrolled ? "is-hidden" : ""}`}>
          <span className="scroll-mouse" />
        </div>
      </section>

      <main className="main-content-scroll">
        {/* 3. İSTATİSTİK ŞERİDİ */}
        <section className="stats-strip">
          <Reveal variant="up" className="stat-card">
            <div className="stat-value">
              <CountUp end={18.5} decimals={1} suffix="%" />
            </div>
            <div className="stat-label">Ortalama Yıllık Getiri</div>
          </Reveal>
          <Reveal variant="up" delay={100} className="stat-card">
            <div className="stat-value">
              <CountUp end={1250} suffix="+" />
            </div>
            <div className="stat-label">Bireysel & Kurumsal Yatırımcı</div>
          </Reveal>
          <Reveal variant="up" delay={200} className="stat-card">
            <div className="stat-value">
              <CountUp end={2026} grouping={false} />
            </div>
            <div className="stat-label">Kuruluş Yılı</div>
          </Reveal>
          <Reveal variant="up" delay={300} className="stat-card">
            <div className="stat-value">7/24</div>
            <div className="stat-label">Piyasa Takibi</div>
          </Reveal>
        </section>

        {/* 4. GRAFİK PANELİ */}
        <section className="chart-split-section">
          <Reveal variant="zoom" className="chart-container-premium">
            <div className="chart-header-info">
              <div className="title-group">
                <h3>Piyasa Analiz Paneli</h3>
                <p className="chart-subtitle">
                  Anlık portföy ve market verileri
                </p>
              </div>
              <div className="live-status">
                <span className="pulse-dot" />
                <span className="live-tag">CANLI VERİ AKIŞI</span>
              </div>
            </div>
            <div className="actual-chart-wrapper">
              <MarketChart />
            </div>
          </Reveal>
        </section>

        {/* 5. ÖNE ÇIKAN FONLAR */}
        <FeaturedFunds />

        {/* 6. NEDEN QUANTSHINE? — metin + görsel */}
        <section className="why-section">
          <div className="why-wrapper">
            <Reveal variant="left" className="why-text">
              <h2 className="section-title why-title">
                Neden <span className="why-brand">QuantShine?</span>
              </h2>
              <p>
                Güçlü analiz ekosistemi, çevik organizasyon yapısı ve uzman
                kadrosuyla yatırımcılarına disiplinli ve sürdürülebilir portföy
                yönetimi çözümleri sunar. QuantShine Capital'in farkını yaratan
                veri odaklı yaklaşımı keşfedin.
              </p>
              <Link to="/hakkimizda" className="cta-button why-btn">
                Devamını Oku <ArrowRight size={18} />
              </Link>
            </Reveal>
            <Reveal variant="right" delay={120} className="why-visual">
              <div className="why-glass">
                <img src="/quantshine_capital.png" alt="QuantShine Capital" />
              </div>
            </Reveal>
          </div>

          <div className="social-proof-grid">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} variant="up" delay={i * 100} className="grid-item">
                <div className="grid-icon-box">
                  <f.icon size={26} strokeWidth={2} />
                </div>
                <h4>{f.title}</h4>
                <p>{f.text}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* 7. PORTFÖY BAŞLATMA PANELİ */}
        <section className="dual-panel-section">
          <Reveal variant="up" className="dual-panel dual-panel--dark dual-panel--full">
            <h3>Nasıl Portföy Yönetimi Başlatırım?</h3>
            <p>
              Bireysel veya kurumsal yatırımcı olarak başvurunuzu oluşturun;
              risk profiliniz analiz edilsin ve size özel portföy stratejiniz
              kurulsun. Süreç hızlı ve şeffaftır. Uzman ekibimizle tanışmak için
              bizimle iletişime geçin.
            </p>
            <div className="dual-panel-actions">
              <Link to="/iletisim" className="cta-button">
                İletişime Geç <ArrowRight size={18} />
              </Link>
            </div>
          </Reveal>
        </section>

        {/* 8. CANLI HABER AKIŞI */}
        <section className="landing-blog-section">
          <Reveal variant="up" className="blog-section-header">
            <h2 className="section-title">Piyasa Haberleri & Analizler</h2>
            <p className="section-subtitle">
              Hisse senetleri, emtia, döviz ve kripto piyasalarından anlık haber
              akışı.
            </p>
          </Reveal>
          <Reveal variant="up" className="news-component-wrapper">
            <NewsSection />
          </Reveal>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;

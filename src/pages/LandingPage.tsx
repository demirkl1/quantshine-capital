import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
import Seo from "../components/Seo";
import "./LandingPage.css";

const LandingPage = () => {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);

  const FEATURES = [
    { icon: TrendingUp, title: t("why.feature1Title"), text: t("why.feature1Text") },
    { icon: ShieldCheck, title: t("why.feature2Title"), text: t("why.feature2Text") },
    { icon: Users, title: t("why.feature3Title"), text: t("why.feature3Text") },
    { icon: Zap, title: t("why.feature4Title"), text: t("why.feature4Text") },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="landing-page-container">
      <Seo title="" description={t("hero.subtitle")} path="/" />
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
            <h1 className="hero-main-title">{t("hero.title")}</h1>
          </Reveal>
          <Reveal variant="up" delay={120}>
            <p className="hero-sub-text">{t("hero.subtitle")}</p>
          </Reveal>
          <Reveal variant="up" delay={200} className="hero-cta-group">
            <Link to="/portfoy-bireysel" className="cta-button">
              {t("hero.ctaPortfolio")} <ArrowRight size={18} />
            </Link>
            <Link to="/fonlarimiz" className="cta-button cta-button--ghost">
              {t("hero.ctaFunds")}
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
            <div className="stat-label">{t("stats.return")}</div>
          </Reveal>
          <Reveal variant="up" delay={100} className="stat-card">
            <div className="stat-value">
              <CountUp end={1250} suffix="+" />
            </div>
            <div className="stat-label">{t("stats.investors")}</div>
          </Reveal>
          <Reveal variant="up" delay={200} className="stat-card">
            <div className="stat-value">
              <CountUp end={2026} grouping={false} />
            </div>
            <div className="stat-label">{t("stats.founded")}</div>
          </Reveal>
          <Reveal variant="up" delay={300} className="stat-card">
            <div className="stat-value">7/24</div>
            <div className="stat-label">{t("stats.monitoring")}</div>
          </Reveal>
        </section>

        {/* 4. GRAFİK PANELİ */}
        <section className="chart-split-section">
          <Reveal variant="zoom" className="chart-container-premium">
            <div className="chart-header-info">
              <div className="title-group">
                <h3>{t("chart.title")}</h3>
                <p className="chart-subtitle">{t("chart.subtitle")}</p>
              </div>
              <div className="live-status">
                <span className="pulse-dot" />
                <span className="live-tag">{t("chart.live")}</span>
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
                {t("why.titlePrefix")}
                <span className="why-brand">{t("why.brand")}</span>
              </h2>
              <p>{t("why.body")}</p>
              <Link to="/hakkimizda" className="cta-button why-btn">
                {t("why.readMore")} <ArrowRight size={18} />
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
            <h3>{t("startPanel.title")}</h3>
            <p>{t("startPanel.body")}</p>
            <div className="dual-panel-actions">
              <Link to="/iletisim" className="cta-button">
                {t("startPanel.cta")} <ArrowRight size={18} />
              </Link>
            </div>
          </Reveal>
        </section>

        {/* 8. CANLI HABER AKIŞI */}
        <section className="landing-blog-section">
          <Reveal variant="up" className="blog-section-header">
            <h2 className="section-title">{t("news.title")}</h2>
            <p className="section-subtitle">{t("news.subtitle")}</p>
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

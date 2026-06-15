import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Target,
  Eye,
  Handshake,
  ShieldCheck,
  Lightbulb,
  Activity,
  ArrowRight,
} from "lucide-react";
import Reveal from "../components/Reveal";
import CountUp from "../components/CountUp";
import ScrollToTop from "../components/ScrollToTop";
import Seo from "../components/Seo";
import "./AboutUs.css";

export default function AboutPage() {
  const { t } = useTranslation();

  const VALUES = [
    { icon: Handshake, title: t("about.value1Title"), text: t("about.value1Text") },
    { icon: Eye, title: t("about.value2Title"), text: t("about.value2Text") },
    { icon: Lightbulb, title: t("about.value3Title"), text: t("about.value3Text") },
    { icon: ShieldCheck, title: t("about.value4Title"), text: t("about.value4Text") },
  ];

  return (
    <div className="about-page">
      <Seo title={t("about.title")} description={t("about.subtitle")} path="/hakkimizda" />
      {/* Başlık */}
      <section className="about-hero">
        <div className="about-hero-bg" />
        <Reveal variant="up" className="about-hero-inner">
          <span className="about-badge">{t("about.badge")}</span>
          <h1 className="about-title">{t("about.title")}</h1>
          <div className="about-underline" />
          <p className="about-subtitle">{t("about.subtitle")}</p>
        </Reveal>
      </section>

      {/* Biz Kimiz */}
      <section className="about-who">
        <Reveal variant="left" className="about-who-media">
          <div className="about-glass">
            <img src="/quantshine_capital.png" alt="QuantShine Capital" />
          </div>
        </Reveal>
        <Reveal variant="right" delay={120} className="about-who-text">
          <h2 className="about-section-title">{t("about.whoTitle")}</h2>
          <p>{t("about.whoP1")}</p>
          <p>{t("about.whoP2")}</p>
          <p>{t("about.whoP3")}</p>
        </Reveal>
      </section>

      {/* İstatistik */}
      <section className="about-stats">
        <Reveal variant="up" className="about-stat">
          <div className="about-stat-value">
            <CountUp end={18.5} decimals={1} suffix="%" />
          </div>
          <div className="about-stat-label">{t("about.statReturn")}</div>
        </Reveal>
        <Reveal variant="up" delay={100} className="about-stat">
          <div className="about-stat-value">
            <CountUp end={1250} suffix="+" />
          </div>
          <div className="about-stat-label">{t("about.statInvestors")}</div>
        </Reveal>
        <Reveal variant="up" delay={200} className="about-stat">
          <div className="about-stat-value">
            <CountUp end={2026} grouping={false} />
          </div>
          <div className="about-stat-label">{t("about.statFounded")}</div>
        </Reveal>
        <Reveal variant="up" delay={300} className="about-stat">
          <div className="about-stat-value">7/24</div>
          <div className="about-stat-label">{t("stats.monitoring")}</div>
        </Reveal>
      </section>

      {/* Misyon & Vizyon */}
      <section className="about-mv">
        <Reveal variant="up" className="about-mv-card">
          <div className="about-mv-icon">
            <Target size={26} strokeWidth={2} />
          </div>
          <h3>{t("about.missionTitle")}</h3>
          <p>{t("about.missionText")}</p>
        </Reveal>
        <Reveal variant="up" delay={120} className="about-mv-card">
          <div className="about-mv-icon">
            <Activity size={26} strokeWidth={2} />
          </div>
          <h3>{t("about.visionTitle")}</h3>
          <p>{t("about.visionText")}</p>
        </Reveal>
      </section>

      {/* Değerler */}
      <section className="about-values">
        <Reveal variant="up" className="about-values-head">
          <h2 className="about-section-title">{t("about.valuesTitle")}</h2>
          <p className="about-values-sub">{t("about.valuesSubtitle")}</p>
        </Reveal>
        <div className="about-values-grid">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} variant="up" delay={i * 90} className="about-value-card">
              <div className="about-value-icon">
                <v.icon size={24} strokeWidth={2} />
              </div>
              <h4>{v.title}</h4>
              <p>{v.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta-section">
        <Reveal variant="zoom" className="about-cta">
          <h2>{t("about.ctaTitle")}</h2>
          <p>{t("about.ctaText")}</p>
          <Link to="/iletisim" className="cta-button">
            {t("about.ctaBtn")} <ArrowRight size={18} />
          </Link>
        </Reveal>
      </section>

      <ScrollToTop />
    </div>
  );
}

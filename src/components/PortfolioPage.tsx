import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  User,
  Layers,
  ShieldCheck,
  Lock,
  Building2,
  Headset,
  Activity,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import Reveal from "./Reveal";
import ScrollToTop from "./ScrollToTop";
import Seo from "./Seo";
import "./PortfolioPage.css";

const ICONS: Record<string, LucideIcon[]> = {
  individual: [User, Layers, ShieldCheck, Lock],
  corporate: [Building2, Headset, Activity, ShieldCheck],
};

interface PortfolioPageProps {
  variant: "individual" | "corporate";
}

const PortfolioPage: React.FC<PortfolioPageProps> = ({ variant }) => {
  const { t } = useTranslation();
  const base = `portfolio.${variant}`;
  const icons = ICONS[variant];

  const benefits = [1, 2, 3, 4].map((n, i) => ({
    Icon: icons[i],
    title: t(`${base}.b${n}t`),
    text: t(`${base}.b${n}x`),
  }));

  const tags = [t(`${base}.tag1`), t(`${base}.tag2`), t(`${base}.tag3`)];

  return (
    <div className="pf-page">
      <Seo
        title={t(`${base}.title`)}
        description={t(`${base}.subtitle`)}
        path={variant === "individual" ? "/portfoy-bireysel" : "/portfoy-kurumsal"}
      />
      {/* Hero */}
      <section className="pf-hero">
        <div className="pf-hero-bg" />
        <Reveal variant="up" className="pf-hero-inner">
          <span className="pf-badge">{t(`${base}.badge`)}</span>
          <h1 className="pf-title">{t(`${base}.title`)}</h1>
          <div className="pf-underline" />
          <p className="pf-subtitle">{t(`${base}.subtitle`)}</p>
        </Reveal>
      </section>

      {/* Lead: görsel + metin */}
      <section className="pf-lead">
        <Reveal variant="left" className="pf-lead-media">
          <div className="pf-glass">
            <img src="/quantshine_capital.png" alt="QuantShine Capital" />
          </div>
        </Reveal>
        <Reveal variant="right" delay={120} className="pf-lead-text">
          <h2 className="pf-section-title">{t(`${base}.leadTitle`)}</h2>
          <p className="pf-lead-p">{t(`${base}.lead`)}</p>
          <p>{t(`${base}.body1`)}</p>
          <p>{t(`${base}.body2`)}</p>
          <div className="pf-tags">
            {tags.map((tag) => (
              <span key={tag} className="pf-tag">{tag}</span>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Sunduklarımız */}
      <section className="pf-benefits">
        <Reveal variant="up" className="pf-benefits-head">
          <h2 className="pf-section-title">{t("portfolio.benefitsTitle")}</h2>
        </Reveal>
        <div className="pf-benefits-grid">
          {benefits.map((b, i) => (
            <Reveal key={b.title} variant="up" delay={i * 90} className="pf-benefit-card">
              <div className="pf-benefit-icon">
                <b.Icon size={24} strokeWidth={2} />
              </div>
              <h4>{b.title}</h4>
              <p>{b.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pf-cta-section">
        <Reveal variant="zoom" className="pf-cta">
          <h2>{t("portfolio.ctaTitle")}</h2>
          <p>{t("portfolio.ctaText")}</p>
          <Link to="/iletisim" className="cta-button">
            {t("portfolio.ctaBtn")} <ArrowRight size={18} />
          </Link>
        </Reveal>
      </section>

      <ScrollToTop />
    </div>
  );
};

export default PortfolioPage;

import React from "react";
import { useTranslation } from "react-i18next";
import Reveal from "../components/Reveal";
import ScrollToTop from "../components/ScrollToTop";
import "./LegalPage.css";

interface LegalPageProps {
  docKey: "kvkk" | "disclaimer" | "cookies";
}

const LegalPage: React.FC<LegalPageProps> = ({ docKey }) => {
  const { t } = useTranslation();
  const paragraphs = (t(`legal.${docKey}.body`, { returnObjects: true }) as string[]) || [];

  return (
    <div className="legal-page">
      <section className="legal-hero">
        <div className="legal-hero-bg" />
        <Reveal variant="up" className="legal-hero-inner">
          <h1 className="legal-title">{t(`legal.${docKey}.title`)}</h1>
          <div className="legal-underline" />
        </Reveal>
      </section>

      <div className="legal-main">
        <Reveal variant="up" className="legal-card">
          {paragraphs.map((p, i) => (
            <p key={i} className="legal-p">{p}</p>
          ))}
          <p className="legal-review">{t("legal.reviewNote")}</p>
        </Reveal>
      </div>

      <ScrollToTop />
    </div>
  );
};

export default LegalPage;

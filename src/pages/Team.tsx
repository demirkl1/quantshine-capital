import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Linkedin, ArrowRight } from "lucide-react";
import Reveal from "../components/Reveal";
import ScrollToTop from "../components/ScrollToTop";
import Seo from "../components/Seo";
import "./Team.css";

interface Member {
  name: string;
  role: string;
  bio: string;
}

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const Team: React.FC = () => {
  const { t } = useTranslation();
  const members = (t("team.members", { returnObjects: true }) as Member[]) || [];

  return (
    <div className="team-page">
      <Seo title={t("team.title")} description={t("team.subtitle")} path="/ekip" />
      <section className="team-hero">
        <div className="team-hero-bg" />
        <Reveal variant="up" className="team-hero-inner">
          <h1 className="team-title">{t("team.title")}</h1>
          <div className="team-underline" />
          <p className="team-subtitle">{t("team.subtitle")}</p>
        </Reveal>
      </section>

      <div className="team-main">
        <div className="team-grid">
          {members.map((m, i) => (
            <Reveal key={m.name} variant="up" delay={(i % 3) * 90} className="team-card">
              <div className="team-avatar">{initials(m.name)}</div>
              <h3 className="team-name">{m.name}</h3>
              <span className="team-role">{m.role}</span>
              <p className="team-bio">{m.bio}</p>
              <span className="team-linkedin" aria-hidden="true">
                <Linkedin size={16} />
              </span>
            </Reveal>
          ))}
        </div>

        <p className="team-note">{t("team.note")}</p>

        <Reveal variant="zoom" className="team-cta">
          <h2>{t("team.ctaTitle")}</h2>
          <p>{t("team.ctaText")}</p>
          <Link to="/iletisim" className="cta-button">
            {t("team.ctaBtn")} <ArrowRight size={18} />
          </Link>
        </Reveal>
      </div>

      <ScrollToTop />
    </div>
  );
};

export default Team;

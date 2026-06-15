import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ClipboardCheck, ArrowRight, ArrowLeft, RotateCcw, Check } from "lucide-react";
import Reveal from "../components/Reveal";
import ScrollToTop from "../components/ScrollToTop";
import Seo from "../components/Seo";
import "./Suitability.css";

interface Question {
  q: string;
  options: string[];
}

type ProfileKey = "conservative" | "balanced" | "growth" | "aggressive";

const ALLOCATIONS: Record<ProfileKey, { stocks: number; bonds: number; cash: number; alt: number }> = {
  conservative: { stocks: 15, bonds: 50, cash: 30, alt: 5 },
  balanced: { stocks: 40, bonds: 40, cash: 12, alt: 8 },
  growth: { stocks: 65, bonds: 25, cash: 5, alt: 5 },
  aggressive: { stocks: 80, bonds: 10, cash: 2, alt: 8 },
};

const profileFromScore = (score: number): ProfileKey => {
  if (score <= 10) return "conservative";
  if (score <= 15) return "balanced";
  if (score <= 20) return "growth";
  return "aggressive";
};

const Suitability: React.FC = () => {
  const { t } = useTranslation();
  const questions = (t("suitability.questions", { returnObjects: true }) as Question[]) || [];
  const total = questions.length;

  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    new Array(total).fill(null)
  );
  const [showResult, setShowResult] = useState(false);

  const reset = () => {
    setStarted(false);
    setCurrent(0);
    setAnswers(new Array(total).fill(null));
    setShowResult(false);
  };

  const select = (optIdx: number) => {
    setAnswers((a) => {
      const next = [...a];
      next[current] = optIdx;
      return next;
    });
  };

  const next = () => {
    if (current < total - 1) setCurrent((c) => c + 1);
    else setShowResult(true);
  };

  const score = answers.reduce<number>((sum, a) => sum + (a != null ? a + 1 : 0), 0);
  const profileKey = profileFromScore(score);
  const alloc = ALLOCATIONS[profileKey];

  const allocBars = [
    { key: "stocks", label: t("suitability.allocStocks"), value: alloc.stocks, color: "#3b82f6" },
    { key: "bonds", label: t("suitability.allocBonds"), value: alloc.bonds, color: "#22c55e" },
    { key: "cash", label: t("suitability.allocCash"), value: alloc.cash, color: "#94a3b8" },
    { key: "alt", label: t("suitability.allocAlt"), value: alloc.alt, color: "#f59e0b" },
  ];

  const progress = ((current + (answers[current] != null ? 1 : 0)) / total) * 100;

  return (
    <div className="su-page">
      <Seo title={t("suitability.title")} description={t("suitability.subtitle")} path="/yerindelik-testi" />
      <section className="su-hero">
        <div className="su-hero-bg" />
        <Reveal variant="up" className="su-hero-inner">
          <h1 className="su-title">{t("suitability.title")}</h1>
          <div className="su-underline" />
          <p className="su-subtitle">{t("suitability.subtitle")}</p>
        </Reveal>
      </section>

      <div className="su-main">
        <div className="su-card">
          {/* INTRO */}
          {!started && (
            <div className="su-intro">
              <div className="su-intro-icon">
                <ClipboardCheck size={36} strokeWidth={1.8} />
              </div>
              <p className="su-intro-text">{t("suitability.intro")}</p>
              <button className="cta-button" onClick={() => setStarted(true)}>
                {t("suitability.start")} <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* SORULAR */}
          {started && !showResult && (
            <div className="su-quiz">
              <div className="su-progress-head">
                <span>{t("suitability.step", { current: current + 1, total })}</span>
                <span>{Math.round(((current + 1) / total) * 100)}%</span>
              </div>
              <div className="su-progress">
                <span style={{ width: `${progress}%` }} />
              </div>

              <h2 className="su-question">{questions[current]?.q}</h2>

              <div className="su-options">
                {questions[current]?.options.map((opt, i) => (
                  <button
                    key={i}
                    className={`su-option ${answers[current] === i ? "selected" : ""}`}
                    onClick={() => select(i)}
                  >
                    <span className="su-option-check">
                      {answers[current] === i && <Check size={15} strokeWidth={3} />}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>

              <div className="su-nav">
                <button
                  className="su-back"
                  onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                  disabled={current === 0}
                >
                  <ArrowLeft size={16} /> {t("suitability.back")}
                </button>
                <button
                  className="cta-button"
                  onClick={next}
                  disabled={answers[current] == null}
                >
                  {current === total - 1 ? t("suitability.seeResult") : t("suitability.next")}
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* SONUÇ */}
          {showResult && (
            <Reveal variant="zoom" className="su-result">
              <div className="su-result-badge">{t("suitability.resultTitle")}</div>
              <h2 className="su-profile-name">
                {t(`suitability.profiles.${profileKey}.name`)}
              </h2>
              <p className="su-profile-desc">
                {t(`suitability.profiles.${profileKey}.desc`)}
              </p>

              <div className="su-alloc">
                <h3>{t("suitability.allocTitle")}</h3>
                <div className="su-alloc-stack">
                  {allocBars.map((b) => (
                    <div
                      key={b.key}
                      className="su-alloc-seg"
                      style={{ width: `${b.value}%`, background: b.color }}
                      title={`${b.label}: %${b.value}`}
                    />
                  ))}
                </div>
                <div className="su-alloc-legend">
                  {allocBars.map((b) => (
                    <div key={b.key} className="su-legend-item">
                      <span className="su-legend-dot" style={{ background: b.color }} />
                      <span className="su-legend-label">{b.label}</span>
                      <span className="su-legend-value">%{b.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="su-cta-text">{t("suitability.ctaText")}</p>
              <div className="su-result-actions">
                <Link to="/iletisim" className="cta-button">
                  {t("suitability.ctaBtn")} <ArrowRight size={18} />
                </Link>
                <button className="su-restart" onClick={reset}>
                  <RotateCcw size={16} /> {t("suitability.restart")}
                </button>
              </div>

              <p className="su-disclaimer">{t("suitability.disclaimer")}</p>
            </Reveal>
          )}
        </div>
      </div>

      <ScrollToTop />
    </div>
  );
};

export default Suitability;

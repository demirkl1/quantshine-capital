import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Star, ArrowRight } from "lucide-react";
import api from "../api";
import Reveal from "./Reveal";
import "./FeaturedFunds.css";

interface Fund {
  code: string;
  name: string;
  type?: string;
  riskLevel?: number;
  month?: number | string | null;
}

const CODE_REGEX = /^[A-Z0-9]{2,10}$/;

/* Yerel geliştirmede (backend kapalıyken) tasarımın görünmesi için örnek veri */
const DEMO_FUNDS: Fund[] = [
  { code: "QSH", name: "QuantShine Birinci Hisse Senedi Fonu", type: "Hisse Fonu", riskLevel: 5, month: 4.21 },
  { code: "QPP", name: "QuantShine Para Piyasası (TL) Fonu", type: "Para Piyasası Fon", riskLevel: 2, month: 3.08 },
  { code: "QKT", name: "QuantShine Katılım (TL) Fonu", type: "Katılım Fon", riskLevel: 3, month: 2.74 },
];

const fmtPerf = (v: Fund["month"]) => {
  if (v == null) return "—";
  const n = parseFloat(String(v));
  if (isNaN(n)) return "—";
  return `%${n >= 0 ? "+" : ""}${n.toFixed(2)}`;
};

const perfClass = (v: Fund["month"]) => {
  if (v == null) return "";
  const n = parseFloat(String(v));
  if (isNaN(n)) return "";
  return n >= 0 ? "ff-positive" : "ff-negative";
};

const FeaturedFunds: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [funds, setFunds] = useState<Fund[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    api
      .get("/funds", { signal: controller.signal })
      .then(({ data }) => {
        if (Array.isArray(data) && data.length) {
          setFunds(data.slice(0, 3));
        } else if (process.env.NODE_ENV === "development") {
          setFunds(DEMO_FUNDS);
        }
      })
      .catch(() => {
        if (process.env.NODE_ENV === "development") setFunds(DEMO_FUNDS);
      });
    return () => controller.abort();
  }, []);

  const goToFund = (code: string) => {
    if (CODE_REGEX.test(code)) navigate(`/fund/${encodeURIComponent(code)}`);
  };

  if (!funds.length) return null;

  return (
    <section className="featured-funds-section">
      <Reveal variant="up" className="ff-header">
        <h2 className="section-title">{t("featured.title")}</h2>
        <button className="ff-all-btn" onClick={() => navigate("/fonlarimiz")}>
          {t("featured.all")}
        </button>
      </Reveal>

      <div className="ff-grid">
        {funds.map((fund, i) => (
          <Reveal key={fund.code} variant="up" delay={i * 110} className="ff-card">
            <div className="ff-card-top">
              <span className="ff-code">{fund.code}</span>
              <span className="ff-type">
                {fund.type || "Yatırım Fonu"} <Star size={14} fill="currentColor" />
              </span>
            </div>

            <h3 className="ff-name">{fund.name}</h3>

            <div className="ff-divider" />

            <div className="ff-row">
              <span className="ff-row-label">{t("featured.lastMonth")}</span>
              <span className={`ff-row-value ${perfClass(fund.month)}`}>
                {fmtPerf(fund.month)}
              </span>
            </div>

            <div className="ff-row">
              <span className="ff-row-label">{t("featured.risk")}</span>
              <span className="ff-risk">
                <span className="ff-risk-bar">
                  <span
                    className="ff-risk-fill"
                    style={{ width: `${((fund.riskLevel || 1) / 7) * 100}%` }}
                  />
                </span>
                {fund.riskLevel ?? "—"}
              </span>
            </div>

            <button className="ff-incele" onClick={() => goToFund(fund.code)}>
              {t("featured.review")} <ArrowRight size={16} />
            </button>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default FeaturedFunds;

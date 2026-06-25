import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Star, ArrowRight } from "lucide-react";
import api from "../api";
import Reveal from "./Reveal";
import Sparkline from "./Sparkline";
import "./FeaturedFunds.css";

interface Fund {
  code: string;
  name: string;
  type?: string;
  riskLevel?: number;
  month?: number | string | null;
}

const CODE_REGEX = /^[A-Z0-9]{2,10}$/;

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

/* Gerçek tarihsel seri henüz API'de yok → fon koduna göre tohumlanmış,
   performans yönünde (artı→yukarı) eğilimli dekoratif bir trend üretir.
   Aynı fon her zaman aynı çizgiyi verir (deterministik). */
const sparkSeries = (code: string, month: Fund["month"]): number[] => {
  let seed = 0;
  for (let i = 0; i < code.length; i++) seed = (seed * 31 + code.charCodeAt(i)) >>> 0;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };
  const n = parseFloat(String(month ?? 0));
  const drift = isNaN(n) ? 0.2 : n >= 0 ? 0.55 : -0.55;
  const out: number[] = [];
  let v = 50;
  for (let i = 0; i < 16; i++) {
    v += (rand() - 0.5) * 8 + drift * 2.2;
    out.push(v);
  }
  return out;
};

const isPositive = (v: Fund["month"]) => {
  const n = parseFloat(String(v ?? 0));
  return isNaN(n) ? true : n >= 0;
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
        // Yalnızca backend'den gelen gerçek aktif fonlar gösterilir.
        if (Array.isArray(data) && data.length) {
          setFunds(data.slice(0, 3));
        } else {
          setFunds([]);
        }
      })
      .catch(() => setFunds([]));
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

            <div className="ff-spark">
              <Sparkline
                values={sparkSeries(fund.code, fund.month)}
                color={isPositive(fund.month) ? "#4ade80" : "#f87171"}
                width={260}
                height={44}
                className="ff-spark-svg"
              />
            </div>

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

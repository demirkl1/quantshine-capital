import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { TrendingUp, Wallet, PiggyBank, ArrowRight } from "lucide-react";
import Reveal from "../components/Reveal";
import ScrollToTop from "../components/ScrollToTop";
import Seo from "../components/Seo";
import "./Simulator.css";

const fmtTRY = (n: number, lang: string) =>
  new Intl.NumberFormat(lang === "en" ? "en-US" : "tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(n);

const fmtCompact = (n: number, lang: string) =>
  new Intl.NumberFormat(lang === "en" ? "en-US" : "tr-TR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

const Simulator: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("en") ? "en" : "tr";

  const [initial, setInitial] = useState(100000);
  const [monthly, setMonthly] = useState(5000);
  const [years, setYears] = useState(10);
  const [annualReturn, setAnnualReturn] = useState(18.5);

  const { data, finalValue, invested, gain } = useMemo(() => {
    const r = annualReturn / 100 / 12;
    const points: { year: number; value: number; invested: number }[] = [];
    for (let y = 0; y <= years; y++) {
      const m = y * 12;
      const fv =
        r === 0
          ? initial + monthly * m
          : initial * Math.pow(1 + r, m) +
            monthly * ((Math.pow(1 + r, m) - 1) / r);
      points.push({
        year: y,
        value: Math.round(fv),
        invested: Math.round(initial + monthly * m),
      });
    }
    const last = points[points.length - 1];
    return {
      data: points,
      finalValue: last.value,
      invested: last.invested,
      gain: last.value - last.invested,
    };
  }, [initial, monthly, years, annualReturn]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const p = payload[0].payload;
    return (
      <div className="sim-tooltip">
        <div className="sim-tooltip-year">{t("simulator.yearAxis")} {p.year}</div>
        <div className="sim-tooltip-row">
          <span className="dot value" /> {t("simulator.projectedValue")}:{" "}
          <strong>{fmtTRY(p.value, lang)}</strong>
        </div>
        <div className="sim-tooltip-row">
          <span className="dot invested" /> {t("simulator.invested")}:{" "}
          <strong>{fmtTRY(p.invested, lang)}</strong>
        </div>
      </div>
    );
  };

  return (
    <div className="sim-page">
      <Seo title={t("simulator.title")} description={t("simulator.subtitle")} path="/simulasyon" />
      {/* Hero */}
      <section className="sim-hero">
        <div className="sim-hero-bg" />
        <Reveal variant="up" className="sim-hero-inner">
          <h1 className="sim-title">{t("simulator.title")}</h1>
          <div className="sim-underline" />
          <p className="sim-subtitle">{t("simulator.subtitle")}</p>
        </Reveal>
      </section>

      <div className="sim-main">
        <Reveal variant="up" className="sim-card">
          <div className="sim-grid">
            {/* Kontroller */}
            <div className="sim-controls">
              <SliderField
                label={t("simulator.initial")}
                value={initial}
                min={0}
                max={1000000}
                step={10000}
                onChange={setInitial}
                display={fmtTRY(initial, lang)}
              />
              <SliderField
                label={t("simulator.monthly")}
                value={monthly}
                min={0}
                max={50000}
                step={500}
                onChange={setMonthly}
                display={fmtTRY(monthly, lang)}
              />
              <SliderField
                label={t("simulator.years")}
                value={years}
                min={1}
                max={30}
                step={1}
                onChange={setYears}
                display={`${years} ${t("simulator.yearsUnit")}`}
              />
              <SliderField
                label={t("simulator.return")}
                value={annualReturn}
                min={0}
                max={40}
                step={0.5}
                onChange={setAnnualReturn}
                display={`%${annualReturn.toLocaleString(lang === "en" ? "en-US" : "tr-TR")}`}
              />
            </div>

            {/* Sonuç + grafik */}
            <div className="sim-result">
              <div className="sim-stats">
                <div className="sim-stat sim-stat--accent">
                  <div className="sim-stat-icon"><TrendingUp size={20} /></div>
                  <div>
                    <div className="sim-stat-label">{t("simulator.finalValue")}</div>
                    <div className="sim-stat-value">{fmtTRY(finalValue, lang)}</div>
                  </div>
                </div>
                <div className="sim-stat">
                  <div className="sim-stat-icon"><Wallet size={18} /></div>
                  <div>
                    <div className="sim-stat-label">{t("simulator.totalInvested")}</div>
                    <div className="sim-stat-value sm">{fmtTRY(invested, lang)}</div>
                  </div>
                </div>
                <div className="sim-stat">
                  <div className="sim-stat-icon gain"><PiggyBank size={18} /></div>
                  <div>
                    <div className="sim-stat-label">{t("simulator.totalGain")}</div>
                    <div className="sim-stat-value sm gain-text">+{fmtTRY(gain, lang)}</div>
                  </div>
                </div>
              </div>

              <div className="sim-chart">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gInv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#64748b" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#64748b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="year"
                      stroke="#64748b"
                      tick={{ fontSize: 12, fill: "#94a3b8" }}
                    />
                    <YAxis
                      stroke="#64748b"
                      tick={{ fontSize: 12, fill: "#94a3b8" }}
                      tickFormatter={(v) => fmtCompact(v, lang)}
                      width={48}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="invested"
                      stroke="#94a3b8"
                      strokeWidth={2}
                      fill="url(#gInv)"
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fill="url(#gValue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <p className="sim-disclaimer">{t("simulator.disclaimer")}</p>
        </Reveal>

        <Reveal variant="up" className="sim-cta">
          <h2>{t("simulator.ctaTitle")}</h2>
          <Link to="/iletisim" className="cta-button">
            {t("simulator.ctaBtn")} <ArrowRight size={18} />
          </Link>
        </Reveal>
      </div>

      <ScrollToTop />
    </div>
  );
};

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}

const SliderField: React.FC<SliderFieldProps> = ({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="sim-field">
      <div className="sim-field-head">
        <label>{label}</label>
        <span className="sim-field-value">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          background: `linear-gradient(90deg, #3b82f6 ${pct}%, rgba(255,255,255,0.1) ${pct}%)`,
        }}
      />
    </div>
  );
};

export default Simulator;

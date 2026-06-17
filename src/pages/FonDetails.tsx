import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import {
  AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import api from "../api";
import type { Fund, Advisor, Investor, Holding, Trade, ChartPoint, Report } from "../types/domain";
import ScrollToTop from "../components/ScrollToTop";
import "./FonDetails.css";

const CODE_REGEX = /^[A-Z0-9]{2,10}$/;
const PERIOD_KEYS = ["1A", "3A", "6A", "1Y", "3Y", "5Y"];
const PERF_KEYS = ["day", "month", "q3", "q6", "ytd", "year"];
const PIE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#f87171", "#ab47bc", "#26c6da", "#9ccc65"];

const fmtPerf = (v) => {
  const n = parseFloat(v);
  if (isNaN(n)) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
};
const perfClass = (v) => {
  const n = parseFloat(v);
  if (isNaN(n)) return "";
  return n >= 0 ? "positive" : "negative";
};

export default function FundDetail() {
  const { code } = useParams();
  const { t } = useTranslation();

  const [fund, setFund] = useState<Fund | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [period, setPeriod] = useState("1A");
  const [loadingFund, setLoadingFund] = useState(true);
  const [loadingChart, setLoadingChart] = useState(false);
  const [fundError, setFundError] = useState<string | null>(null);

  const isValidCode = CODE_REGEX.test(code ?? "");

  const fetchFund = useCallback(async (signal) => {
    if (!isValidCode) return;
    setLoadingFund(true);
    setFundError(null);
    try {
      const { data } = await api.get(`/funds/${encodeURIComponent(code || "")}`, { signal });
      setFund(data);
    } catch (err: any) {
      if (err.name === "CanceledError" || err.name === "AbortError") return;
      setFundError(err.response?.status === 404 ? t("fundDetail.notFound") : t("fundDetail.loadError"));
    } finally {
      setLoadingFund(false);
    }
  }, [code, isValidCode, t]);

  const fetchHistory = useCallback(async (signal) => {
    if (!isValidCode || !fund) return;
    setLoadingChart(true);
    try {
      const { data } = await api.get(`/funds/${encodeURIComponent(code || "")}/history`, { params: { period }, signal });
      setChartData(Array.isArray(data) ? data : []);
    } catch (err: any) {
      if (err.name === "CanceledError" || err.name === "AbortError") return;
      setChartData([]);
    } finally {
      setLoadingChart(false);
    }
  }, [code, period, isValidCode, fund]);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchFund(ctrl.signal);
    return () => ctrl.abort();
  }, [fetchFund]);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchHistory(ctrl.signal);
    return () => ctrl.abort();
  }, [fetchHistory]);

  const BackBar = (
    <Link to="/fonlarimiz" className="fd-back">
      <ArrowLeft size={16} /> {t("fundDetail.back")}
    </Link>
  );

  if (!isValidCode) {
    return (
      <div className="fd-page"><div className="fd-inner">
        {BackBar}
        <p className="fd-error">{t("fundDetail.invalidCode")}</p>
      </div></div>
    );
  }
  if (loadingFund) {
    return (
      <div className="fd-page"><div className="fd-inner" style={{ textAlign: "center", padding: "100px 0" }}>
        <div className="fd-spinner" style={{ margin: "0 auto 16px" }} />
        <p style={{ color: "#94a3b8" }}>{t("fundDetail.loading")}</p>
      </div></div>
    );
  }
  if (fundError || !fund) {
    return (
      <div className="fd-page"><div className="fd-inner">
        {BackBar}
        <p className="fd-error">{fundError || t("fundDetail.notFound")}</p>
      </div></div>
    );
  }

  const perfItems = PERF_KEYS
    .map((k) => ({ label: t(`fundDetail.perf.${k}`), val: fund.performance?.[k] }))
    .filter(({ val }) => val != null && !isNaN(parseFloat(String(val))));

  const tefasYes = fund.tefas === true || (fund.tefas as any) === "Evet";

  return (
    <div className="fd-page">
      <div className="fd-hero-bg" />
      <div className="fd-inner">
        {BackBar}

        {/* Başlık kartı */}
        <div className="fd-header">
          <div className="fd-title-row">
            <span className="fd-code">{fund.code}</span>
            <div>
              <h1 className="fd-title">{fund.name}</h1>
              <div className="fd-tags">
                {fund.type && <span className="fd-tag">{fund.type}</span>}
                {fund.currency && <span className="fd-tag">{fund.currency}</span>}
                {tefasYes && <span className="fd-tag fd-tag--accent">{t("fundDetail.tefas")}</span>}
              </div>
            </div>
          </div>

          <div className="fd-stats">
            <div className="fd-stat">
              <span className="fd-stat-label">{t("fundDetail.price")}</span>
              <span className="fd-stat-value">{Number(fund.price ?? 0).toFixed(4)} ₺</span>
            </div>
            {fund.totalValue != null && (
              <div className="fd-stat">
                <span className="fd-stat-label">{t("fundDetail.totalValue")}</span>
                <span className="fd-stat-value">{fund.totalValue} ₺</span>
              </div>
            )}
            {fund.inceptionDate && (
              <div className="fd-stat">
                <span className="fd-stat-label">{t("fundDetail.inception")}</span>
                <span className="fd-stat-value">{fund.inceptionDate}</span>
              </div>
            )}
            <div className="fd-stat">
              <span className="fd-stat-label">{t("fundDetail.risk")}</span>
              <span className="fd-stat-value fd-risk">
                <span className="fd-risk-bar">
                  <span className="fd-risk-fill" style={{ width: `${((fund.riskLevel || 1) / 7) * 100}%` }} />
                </span>
                {fund.riskLevel}/7
              </span>
            </div>
          </div>
        </div>

        {/* Performans pill'leri */}
        {perfItems.length > 0 && (
          <div className="fd-perf">
            {perfItems.map(({ label, val }) => (
              <div className="fd-perf-pill" key={label}>
                <span className="fd-perf-label">{label}</span>
                <span className={`fd-perf-value ${perfClass(val)}`}>{fmtPerf(val)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Grafik */}
        <div className="fd-card">
          <div className="fd-card-head">
            <h3>{t("fundDetail.chartTitle")}</h3>
            <div className="fd-periods">
              {PERIOD_KEYS.map((key) => (
                <button
                  key={key}
                  onClick={() => setPeriod(key)}
                  className={`fd-period-btn ${period === key ? "active" : ""}`}
                >
                  {t(`fundDetail.periods.${key}`)}
                </button>
              ))}
            </div>
          </div>

          {loadingChart ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
              <div className="fd-spinner" />
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={chartData} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fundGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11, fill: "#94a3b8" }} minTickGap={30} />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  width={55}
                  tickFormatter={(n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n))}
                />
                <Tooltip
                  contentStyle={{ background: "#0d1320", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", color: "#f8fafc", fontSize: 12 }}
                  labelStyle={{ color: "#94a3b8" }}
                />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} fill="url(#fundGrad)" dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: "#3b82f6" }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="fd-empty">{t("fundDetail.noChart")}</p>
          )}
        </div>

        {/* Varlık dağılımı */}
        {Array.isArray(fund.allocation) && fund.allocation.length > 0 && (
          <div className="fd-card">
            <div className="fd-card-head"><h3>{t("fundDetail.allocationTitle")}</h3></div>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={(fund.allocation ?? []) as any} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110}
                  label={({ name, value }) => `${name}: %${value}`} labelLine={{ stroke: "rgba(255,255,255,0.2)" }}>
                  {(fund.allocation ?? []).map((_, i) => (
                    <Cell key={`cell-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#0d1320", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", color: "#f8fafc", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      <ScrollToTop />
    </div>
  );
}

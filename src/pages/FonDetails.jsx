import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import api from "../api";
import "./FonDetails.css";

/* ── Sabitler ──────────────────────────────────────────────── */
const CODE_REGEX = /^[A-Z0-9]{2,10}$/;

const PERIODS = [
  { key: "1A",  label: "1 Ay"  },
  { key: "3A",  label: "3 Ay"  },
  { key: "6A",  label: "6 Ay"  },
  { key: "1Y",  label: "1 Yıl" },
  { key: "3Y",  label: "3 Yıl" },
  { key: "5Y",  label: "5 Yıl" },
];

const PIE_COLORS = [
  "#2962ff", "#26a69a", "#f59e0b",
  "#ef5350", "#ab47bc", "#26c6da", "#9ccc65",
];

/* ── Yardımcı ──────────────────────────────────────────────── */
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

/* ── Spinner ───────────────────────────────────────────────── */
const Spinner = ({ style }) => (
  <div className="fund-spinner" style={style} />
);

/* ══════════════════════════════════════════════════════════════ */
export default function FundDetail() {
  const { code } = useParams();

  const [fund,         setFund]         = useState(null);
  const [chartData,    setChartData]    = useState([]);
  const [period,       setPeriod]       = useState("1A");
  const [loadingFund,  setLoadingFund]  = useState(true);
  const [loadingChart, setLoadingChart] = useState(false);
  const [fundError,    setFundError]    = useState(null);

  /* Güvenlik: URL'den gelen kodu doğrula */
  const isValidCode = CODE_REGEX.test(code ?? "");

  /* ── Fon detayı çek ──────────────────────────────────────── */
  const fetchFund = useCallback(async (signal) => {
    if (!isValidCode) return;
    setLoadingFund(true);
    setFundError(null);
    try {
      const { data } = await api.get(
        `/funds/${encodeURIComponent(code)}`,
        { signal }
      );
      setFund(data);
    } catch (err) {
      if (err.name === "CanceledError" || err.name === "AbortError") return;
      const msg =
        err.response?.status === 404
          ? "Fon bulunamadı."
          : "Fon bilgileri yüklenemedi. Lütfen daha sonra tekrar deneyin.";
      setFundError(msg);
    } finally {
      setLoadingFund(false);
    }
  }, [code, isValidCode]);

  /* ── Grafik geçmişi çek ──────────────────────────────────── */
  const fetchHistory = useCallback(async (signal) => {
    if (!isValidCode || !fund) return;
    setLoadingChart(true);
    try {
      const { data } = await api.get(
        `/funds/${encodeURIComponent(code)}/history`,
        { params: { period }, signal }
      );
      setChartData(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.name === "CanceledError" || err.name === "AbortError") return;
      setChartData([]); /* Grafik hatası kritik değil */
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

  /* ── Geçersiz kod ────────────────────────────────────────── */
  if (!isValidCode) {
    return (
      <div className="fund-detail-container">
        <div className="fund-detail-inner">
          <p style={{ color: "#ef5350", textAlign: "center", padding: "60px 0" }}>
            Geçersiz fon kodu.
          </p>
          <div className="auth-buttons-section">
            <Link to="/fonlarimiz" className="btn">← Geri dön</Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Yükleniyor ──────────────────────────────────────────── */
  if (loadingFund) {
    return (
      <div className="fund-detail-container">
        <div className="fund-detail-inner" style={{ textAlign: "center", padding: "100px 0" }}>
          <Spinner style={{ margin: "0 auto 16px" }} />
          <p style={{ color: "#787b86" }}>Fon bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  /* ── Hata / bulunamadı ───────────────────────────────────── */
  if (fundError || !fund) {
    return (
      <div className="fund-detail-container">
        <div className="fund-detail-inner">
          <p style={{ color: "#ef5350", textAlign: "center", padding: "60px 0" }}>
            {fundError || "Fon bulunamadı."}
          </p>
          <div className="auth-buttons-section">
            <Link to="/fonlarimiz" className="btn">← Geri dön</Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Performans satırı ───────────────────────────────────── */
  const perfItems = [
    { label: "1 Gün", val: fund.performance?.day   },
    { label: "1 Ay",  val: fund.performance?.month },
    { label: "3 Ay",  val: fund.performance?.q3    },
    { label: "6 Ay",  val: fund.performance?.q6    },
    { label: "YTD",   val: fund.performance?.ytd   },
    { label: "1 Yıl", val: fund.performance?.year  },
  ];

  /* ── JSX ─────────────────────────────────────────────────── */
  return (
    <div className="fund-detail-container">
      <div className="fund-detail-inner">

        {/* Geri */}
        <div className="auth-buttons-section">
          <Link to="/fonlarimiz" className="btn">← Geri dön</Link>
        </div>

        {/* Başlık kartı */}
        <div className="fund-header">
          <div className="fund-title-section">
            <h1 className="fund-title">
              {fund.name}
              <span className="fund-code"> ({fund.code})</span>
            </h1>
            <p className="fund-sub">
              {fund.type}
              {fund.currency ? ` · ${fund.currency}` : ""}
              {fund.tefas === true || fund.tefas === "Evet" ? " · TEFAS'ta işlem görür" : ""}
            </p>
          </div>

          <div className="fund-stats">
            <div className="stat-item">
              <span className="stat-label">Fon Fiyatı</span>
              <span className="stat-value">
                {parseFloat(fund.price).toFixed(4)} ₺
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Toplam Değer</span>
              <span className="stat-value">{fund.totalValue} ₺</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Kuruluş Tarihi</span>
              <span className="stat-value">{fund.inceptionDate}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Risk Derecesi</span>
              <span className="stat-value">{fund.riskLevel}/7</span>
            </div>
          </div>
        </div>

        {/* Performans özetleri — sadece backend'den değer gelen dönemler gösterilir */}
        {perfItems.some(({ val }) => val != null) && (
          <div className="performance-summary">
            {perfItems
              .filter(({ val }) => val != null && !isNaN(parseFloat(val)))
              .map(({ label, val }) => (
                <div className="perf-pill" key={label}>
                  <span className="perf-label">{label}</span>
                  <span className={`perf-value ${perfClass(val)}`}>
                    {fmtPerf(val)}
                  </span>
                </div>
              ))}
          </div>
        )}

        {/* Dönem filtreleri */}
        <div className="filter-buttons">
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`filter-btn ${period === key ? "active" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Getiri grafiği */}
        <div className="chart-container">
          <p className="chart-title">Fon Getiri Grafiği — {period}</p>

          {loadingChart ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
              <Spinner />
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={chartData}
                margin={{ top: 6, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="fundGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2962ff" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2962ff" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#434651"
                  tick={{ fontSize: 11, fill: "#787b86", fontFamily: "JetBrains Mono, monospace" }}
                  minTickGap={30}
                />
                <YAxis
                  stroke="#434651"
                  tick={{ fontSize: 11, fill: "#787b86", fontFamily: "JetBrains Mono, monospace" }}
                  width={55}
                  tickFormatter={(n) =>
                    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
                  }
                />
                <Tooltip
                  contentStyle={{
                    background: "#131722",
                    border: "1px solid #2a2e39",
                    borderRadius: "8px",
                    color: "#f8fafc",
                    fontSize: 12,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                  labelStyle={{ color: "#94a3b8" }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2962ff"
                  strokeWidth={2}
                  fill="url(#fundGrad)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0, fill: "#2962ff" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ textAlign: "center", color: "#787b86", padding: "40px 0", fontSize: 13 }}>
              Bu dönem için grafik verisi bulunamadı.
            </p>
          )}
        </div>

        {/* Varlık dağılımı pasta grafiği */}
        {Array.isArray(fund.allocation) && fund.allocation.length > 0 && (
          <div className="pie-container">
            <h3>Varlık Dağılımı</h3>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={fund.allocation}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  label={({ name, value }) => `${name}: %${value}`}
                  labelLine={{ stroke: "#434651" }}
                >
                  {fund.allocation.map((_, i) => (
                    <Cell
                      key={`cell-${i}`}
                      fill={PIE_COLORS[i % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#131722",
                    border: "1px solid #2a2e39",
                    borderRadius: "8px",
                    color: "#f8fafc",
                    fontSize: 12,
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, color: "#94a3b8" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

      </div>
    </div>
  );
}

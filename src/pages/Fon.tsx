import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, Star, ArrowRight } from "lucide-react";
import api from "../api";
import Reveal from "../components/Reveal";
import ScrollToTop from "../components/ScrollToTop";
import Seo from "../components/Seo";
import "./Fon.css";

interface Fund {
  code: string;
  name: string;
  type?: string;
  riskLevel?: number;
  price?: number | string;
  month?: number | string | null;
  ytd?: number | string | null;
  year?: number | string | null;
}

const CODE_REGEX = /^[A-Z0-9]{2,10}$/;

const fmtPrice = (v: Fund["price"]) => {
  const n = parseFloat(String(v));
  return isNaN(n) ? "—" : n.toFixed(4);
};

const fmtPerf = (v: number | string | null | undefined) => {
  if (v == null) return "—";
  const n = parseFloat(String(v));
  if (isNaN(n)) return "—";
  return `%${n >= 0 ? "+" : ""}${n.toFixed(2)}`;
};

const perfClass = (v: number | string | null | undefined) => {
  if (v == null) return "";
  const n = parseFloat(String(v));
  if (isNaN(n)) return "";
  return n >= 0 ? "fc-positive" : "fc-negative";
};

export default function FundCatalog() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const fetchFunds = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/funds", { signal });
      if (!Array.isArray(data)) throw new Error("invalid");
      setFunds(data);
    } catch (err: any) {
      if (err?.name === "CanceledError" || err?.name === "AbortError") return;
      setError(t("funds.error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const controller = new AbortController();
    fetchFunds(controller.signal);
    return () => controller.abort();
  }, [fetchFunds]);

  const types = useMemo(() => {
    const set = new Set<string>();
    funds.forEach((f) => f.type && set.add(f.type));
    return Array.from(set);
  }, [funds]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return funds.filter((f) => {
      const matchesType = typeFilter === "ALL" || f.type === typeFilter;
      const matchesQuery =
        !q ||
        f.name?.toLowerCase().includes(q) ||
        f.code?.toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });
  }, [funds, query, typeFilter]);

  const goToFund = (code: string) => {
    if (CODE_REGEX.test(code)) navigate(`/fund/${encodeURIComponent(code)}`);
  };

  return (
    <div className="funds-page">
      <Seo title={t("funds.pageTitle")} description={t("funds.pageSubtitle")} path="/fonlarimiz" />
      {/* Hero */}
      <section className="funds-hero">
        <div className="funds-hero-bg" />
        <Reveal variant="up" className="funds-hero-inner">
          <h1 className="funds-title">{t("funds.pageTitle")}</h1>
          <div className="funds-underline" />
          <p className="funds-subtitle">{t("funds.pageSubtitle")}</p>
        </Reveal>
      </section>

      <div className="funds-main">
        {/* Kontroller */}
        {!loading && !error && funds.length > 0 && (
          <div className="funds-controls">
            <div className="funds-search">
              <Search size={18} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("funds.search")}
              />
            </div>
            <div className="funds-filters">
              <button
                className={`funds-chip ${typeFilter === "ALL" ? "active" : ""}`}
                onClick={() => setTypeFilter("ALL")}
              >
                {t("funds.filterAll")}
              </button>
              {types.map((ty) => (
                <button
                  key={ty}
                  className={`funds-chip ${typeFilter === ty ? "active" : ""}`}
                  onClick={() => setTypeFilter(ty)}
                >
                  {ty}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Yükleniyor */}
        {loading && (
          <div className="funds-state">
            <div className="funds-spinner" />
            <p>{t("funds.loading")}</p>
          </div>
        )}

        {/* Hata */}
        {error && (
          <div className="funds-state">
            <p className="funds-error">⚠ {error}</p>
            <button className="funds-retry" onClick={() => fetchFunds()}>
              {t("funds.retry")}
            </button>
          </div>
        )}

        {/* Kartlar */}
        {!loading && !error && (
          filtered.length === 0 ? (
            <p className="funds-empty">{t("funds.empty")}</p>
          ) : (
            <div className="funds-grid">
              {filtered.map((fund, i) => (
                <Reveal
                  key={fund.code}
                  variant="up"
                  delay={(i % 3) * 90}
                  className="fc-card"
                  as="div"
                >
                  <div className="fc-top">
                    <span className="fc-code">{fund.code}</span>
                    <span className="fc-type">
                      {fund.type || "Fon"} <Star size={13} fill="currentColor" />
                    </span>
                  </div>

                  <h3 className="fc-name">{fund.name}</h3>

                  <div className="fc-price-row">
                    <span className="fc-price-label">{t("funds.price")} (₺)</span>
                    <span className="fc-price">{fmtPrice(fund.price)}</span>
                  </div>

                  <div className="fc-divider" />

                  <div className="fc-metrics">
                    <div className="fc-metric">
                      <span className="fc-metric-label">{t("funds.lastMonth")}</span>
                      <span className={`fc-metric-value ${perfClass(fund.month)}`}>
                        {fmtPerf(fund.month)}
                      </span>
                    </div>
                    <div className="fc-metric">
                      <span className="fc-metric-label">{t("funds.ytd")}</span>
                      <span className={`fc-metric-value ${perfClass(fund.ytd)}`}>
                        {fmtPerf(fund.ytd)}
                      </span>
                    </div>
                    <div className="fc-metric">
                      <span className="fc-metric-label">{t("funds.year")}</span>
                      <span className={`fc-metric-value ${perfClass(fund.year)}`}>
                        {fmtPerf(fund.year)}
                      </span>
                    </div>
                  </div>

                  <div className="fc-risk-row">
                    <span className="fc-metric-label">{t("funds.risk")}</span>
                    <span className="fc-risk">
                      <span className="fc-risk-bar">
                        <span
                          className="fc-risk-fill"
                          style={{ width: `${((fund.riskLevel || 1) / 7) * 100}%` }}
                        />
                      </span>
                      {fund.riskLevel ?? "—"}
                    </span>
                  </div>

                  <button className="fc-review" onClick={() => goToFund(fund.code)}>
                    {t("funds.review")} <ArrowRight size={16} />
                  </button>
                </Reveal>
              ))}
            </div>
          )
        )}

        {!loading && !error && filtered.length > 0 && (
          <p className="funds-timestamp">
            {t("funds.lastUpdate")}: {new Date().toLocaleString()}
          </p>
        )}
      </div>

      <ScrollToTop />
    </div>
  );
}

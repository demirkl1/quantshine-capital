import { useEffect, useState, useMemo, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, X, ArrowRight } from "lucide-react";
import api from "../api";
import Reveal from "../components/Reveal";
import ScrollToTop from "../components/ScrollToTop";
import Seo from "../components/Seo";
import "./FundCompare.css";

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
const MAX = 3;

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
  return n >= 0 ? "cmp-pos" : "cmp-neg";
};

export default function FundCompare() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    api
      .get("/funds", { signal: controller.signal })
      .then(({ data }) => {
        if (Array.isArray(data)) {
          setFunds(data);
          setSelected(data.slice(0, 2).map((f: Fund) => f.code));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const selectedFunds = useMemo(
    () => selected.map((c) => funds.find((f) => f.code === c)).filter(Boolean) as Fund[],
    [selected, funds]
  );
  const available = useMemo(
    () => funds.filter((f) => !selected.includes(f.code)),
    [funds, selected]
  );

  const addFund = (code: string) => {
    if (code && selected.length < MAX && !selected.includes(code)) {
      setSelected((s) => [...s, code]);
    }
  };
  const removeFund = (code: string) => setSelected((s) => s.filter((c) => c !== code));
  const goToFund = (code: string) => {
    if (CODE_REGEX.test(code)) navigate(`/fund/${encodeURIComponent(code)}`);
  };

  const ROWS: { key: string; label: string; render: (f: Fund) => ReactNode }[] = [
    { key: "type", label: t("compare.metricType"), render: (f) => f.type || "—" },
    { key: "price", label: t("compare.metricPrice"), render: (f) => fmtPrice(f.price) },
    {
      key: "month",
      label: t("compare.metricMonth"),
      render: (f) => <span className={perfClass(f.month)}>{fmtPerf(f.month)}</span>,
    },
    {
      key: "ytd",
      label: t("compare.metricYtd"),
      render: (f) => <span className={perfClass(f.ytd)}>{fmtPerf(f.ytd)}</span>,
    },
    {
      key: "year",
      label: t("compare.metricYear"),
      render: (f) => <span className={perfClass(f.year)}>{fmtPerf(f.year)}</span>,
    },
    {
      key: "risk",
      label: t("compare.metricRisk"),
      render: (f) => (
        <span className="cmp-risk">
          <span className="cmp-risk-bar">
            <span
              className="cmp-risk-fill"
              style={{ width: `${((f.riskLevel || 1) / 7) * 100}%` }}
            />
          </span>
          {f.riskLevel ?? "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="cmp-page">
      <Seo title={t("compare.title")} description={t("compare.subtitle")} path="/fon-karsilastir" />
      <section className="cmp-hero">
        <div className="cmp-hero-bg" />
        <Reveal variant="up" className="cmp-hero-inner">
          <h1 className="cmp-title">{t("compare.title")}</h1>
          <div className="cmp-underline" />
          <p className="cmp-subtitle">{t("compare.subtitle")}</p>
        </Reveal>
      </section>

      <div className="cmp-main">
        {loading ? (
          <p className="cmp-loading">{t("compare.loading")}</p>
        ) : (
          <Reveal variant="up" className="cmp-card">
            {/* Seçim çubuğu */}
            <div className="cmp-picker">
              <select
                className="cmp-select"
                value=""
                onChange={(e) => addFund(e.target.value)}
                disabled={selected.length >= MAX || available.length === 0}
              >
                <option value="">{t("compare.selectPlaceholder")}</option>
                {available.map((f) => (
                  <option key={f.code} value={f.code}>
                    {f.code} — {f.name}
                  </option>
                ))}
              </select>
              <span className="cmp-hint">
                <Plus size={14} /> {t("compare.max")}
              </span>
            </div>

            {selectedFunds.length === 0 ? (
              <p className="cmp-empty">{t("compare.empty")}</p>
            ) : (
              <div className="cmp-table-wrap">
                <table className="cmp-table">
                  <thead>
                    <tr>
                      <th className="cmp-corner" />
                      {selectedFunds.map((f) => (
                        <th key={f.code}>
                          <div className="cmp-col-head">
                            <span className="cmp-code">{f.code}</span>
                            <button
                              className="cmp-remove"
                              onClick={() => removeFund(f.code)}
                              aria-label="remove"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          <div className="cmp-name">{f.name}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ROWS.map((row) => (
                      <tr key={row.key}>
                        <td className="cmp-row-label">{row.label}</td>
                        {selectedFunds.map((f) => (
                          <td key={f.code}>{row.render(f)}</td>
                        ))}
                      </tr>
                    ))}
                    <tr>
                      <td className="cmp-row-label" />
                      {selectedFunds.map((f) => (
                        <td key={f.code}>
                          <button className="cmp-review" onClick={() => goToFund(f.code)}>
                            {t("compare.review")} <ArrowRight size={14} />
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </Reveal>
        )}
      </div>

      <ScrollToTop />
    </div>
  );
}

import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./Fon.css";

/* Performans sütun tanımları */
const PERF_COLS = [
  { key: "day",   label: "Gün"     },
  { key: "month", label: "Ay"      },
  { key: "q3",    label: "3 Ay"    },
  { key: "q6",    label: "6 Ay"    },
  { key: "ytd",   label: "Yılbaşı" },
  { key: "year",  label: "1 Yıl"   },
];

/* Yalnızca büyük harf + rakam, 2-10 karakter */
const CODE_REGEX = /^[A-Z0-9]{2,10}$/;

const fmtPrice = (v) => {
  const n = parseFloat(v);
  return isNaN(n) ? "—" : n.toFixed(4);
};

/* null/undefined → boş göster; değer varsa formatla */
const fmtPerf = (v) => {
  if (v == null) return "";
  const n = parseFloat(v);
  if (isNaN(n)) return "";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
};

const perfClass = (v) => {
  if (v == null) return "";
  const n = parseFloat(v);
  if (isNaN(n)) return "";
  return n >= 0 ? "positive" : "negative";
};

/* ══════════════════════════════════════════════════════════════ */
export default function FundTable() {
  const navigate = useNavigate();
  const [funds,   setFunds]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchFunds = useCallback(async (signal) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/funds", { signal });

      if (!Array.isArray(data)) throw new Error("Geçersiz API yanıtı");
      setFunds(data);
    } catch (err) {
      /* İptal edilen istek hata gösterme */
      if (err.name === "CanceledError" || err.name === "AbortError") return;
      setError("Fon verileri yüklenemedi. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchFunds(controller.signal);
    return () => controller.abort(); /* Unmount → isteği iptal et */
  }, [fetchFunds]);

  /* Güvenli navigasyon: URL injection'ı engelle */
  const handleRowClick = (code) => {
    if (CODE_REGEX.test(code)) {
      navigate(`/fund/${encodeURIComponent(code)}`);
    }
  };

  return (
    <div className="fund-container">
      <div className="fund-page-header">
        <h1>Yatırım Fonları</h1>
        <p className="fund-page-sub">
          QuantShine Capital tarafından yönetilen fonlara tıklayarak detaylı analiz ve performans verilerine ulaşabilirsiniz.
        </p>
      </div>

      {/* Yükleniyor */}
      {loading && (
        <div className="fund-loading">
          <div className="fund-spinner" />
          <p>Fon verileri yükleniyor...</p>
        </div>
      )}

      {/* Hata */}
      {error && (
        <div className="fund-error">
          <span>⚠ {error}</span>
          <button className="retry-btn" onClick={() => fetchFunds()}>
            Tekrar Dene
          </button>
        </div>
      )}

      {/* Tablo */}
      {!loading && !error && (
        <>
          {funds.length === 0 ? (
            <p className="fund-empty">Henüz fon bulunmamaktadır.</p>
          ) : (
            <div className="table-wrapper">
              <table className="fund-table">
                <thead>
                  <tr>
                    <th>Kod</th>
                    <th className="col-name">Fon Ünvanı</th>
                    <th>Tür</th>
                    <th>Risk</th>
                    <th>Fiyat (₺)</th>
                    {PERF_COLS.map((c) => (
                      <th key={c.key}>{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {funds.map((fund) => (
                    <tr
                      key={fund.code}
                      onClick={() => handleRowClick(fund.code)}
                      title={`${fund.name} detaylarını görüntüle`}
                    >
                      <td className="fund-code">{fund.code}</td>
                      <td className="col-name">{fund.name}</td>
                      <td>{fund.type}</td>
                      <td>
                        <span
                          className={`risk-badge ${
                            fund.riskLevel >= 5 ? "risk-high" : "risk-mid"
                          }`}
                        >
                          {fund.riskLevel}
                        </span>
                      </td>
                      <td className="price-cell">{fmtPrice(fund.price)}</td>
                      {PERF_COLS.map((c) => (
                        <td key={c.key} className={perfClass(fund[c.key])}>
                          {fmtPerf(fund[c.key])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="fund-timestamp">
            Son güncelleme: {new Date().toLocaleString("tr-TR")}
          </p>
        </>
      )}
    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import './AdminAnasayfa.css';

const AdminAnasayfa = () => {
  const { token, user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("1A");
  const [loading, setLoading] = useState(true);
  const [selectedFonlar, setSelectedFonlar] = useState(null);
  const [fundSeriesData, setFundSeriesData] = useState({});
  const [marketData, setMarketData] = useState({ bist: [], usd: [] });
  const [showBist, setShowBist] = useState(true);
  const [showUsd, setShowUsd] = useState(true);
  const [fonDropdownOpen, setFonDropdownOpen] = useState(false);

  const FILTER_TO_DAYS = { '1H': 7, '1A': 30, '3A': 90, '6A': 180, '1Y': 365 };

  const CHART_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  const getFonColor = (code) => {
    const idx = fonListesi.findIndex(f => f.fundCode === code || f.fundName === code);
    return CHART_COLORS[Math.max(0, idx) % CHART_COLORS.length];
  };
  const toggleFon = (code) => {
    setSelectedFonlar(prev => {
      if (!prev) return [code];
      return prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code];
    });
  };

  const [financials, setFinancials] = useState({
    sirketFonBuyuklugu: 0,
    sirketKarZararTl: 0,
    fonBuyuklugu: 0,
    fonKarZararTl: 0
  });
  const [fonListesi, setFonListesi] = useState([]);
  const [grafikVerisi, setGrafikVerisi] = useState([]); // legacy, kullanılmıyor


  // Admin DB kaydını senkronize et (Keycloak'ta oluşturulmuş kullanıcılar için gerekli)
  useEffect(() => {
    const syncAdmin = async () => {
      if (!token) return;
      try { await api.get('/users/me'); } catch (e) { console.error("Admin sync hatası:", e.message); }
    };
    syncAdmin();
  }, [token]);

  // Stats (portföy değeri + K/Z) — her 60 saniyede bir yenilenir
  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      try {
        const res = await api.get('/trade/admin-stats');
        setFinancials(res.data);
      } catch (e) { console.error("Stats API Hatası:", e.message); }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [token]);

  // selectedFonlar'ı kullanıcı yüklenince başlat
  useEffect(() => {
    if (selectedFonlar === null && user?.managedFundCode) {
      setSelectedFonlar([user.managedFundCode]);
    }
  }, [user, selectedFonlar]);

  // Fon listesi
  useEffect(() => {
    const fetchFunds = async () => {
      if (!token) return;
      try {
        const res = await api.get('/funds/all-details');
        setFonListesi(res.data);
      } catch (e) { console.error("Tablo API Hatası:", e.message); }
      setLoading(false);
    };
    fetchFunds();
  }, [token]);

  // Fon geçmiş verileri — ham olarak sakla (normalize için)
  useEffect(() => {
    const fetchFundSeries = async () => {
      if (!token || !selectedFonlar || selectedFonlar.length === 0) return;
      try {
        const results = await Promise.all(
          selectedFonlar.map(code =>
            api.get(`/funds/history/${code}?filter=${activeFilter}`)
              .then(res => ({ code, data: Array.isArray(res.data) ? res.data : [] }))
              .catch(() => ({ code, data: [] }))
          )
        );
        const toDay = (v) => {
          if (!v) return null;
          const d = new Date(v);
          return isNaN(d.getTime()) ? String(v).substring(0, 10) : d.toISOString().split('T')[0];
        };
        const newSeries = {};
        results.forEach(({ code, data }) => {
          newSeries[code] = data
            .map(item => ({
              date: toDay(item.date ?? item.priceDate ?? item.recordDate),
              price: parseFloat(item.price ?? item.currentPrice ?? 0) || 0
            }))
            .filter(d => d.date)
            .sort((a, b) => a.date.localeCompare(b.date));
        });
        console.log('[AdminChart] fundSeriesData:', newSeries);
        setFundSeriesData(newSeries);
      } catch (e) { console.error("Fon grafik hatası:", e); }
    };
    fetchFundSeries();
  }, [token, selectedFonlar, activeFilter]);

  // BIST 100 + USD/TRY geçmiş verileri — backend proxy üzerinden (CORS sorunu olmaz)
  useEffect(() => {
    const days = FILTER_TO_DAYS[activeFilter] || 30;
    const toArray = (obj) =>
      Object.entries(obj || {})
        .map(([date, price]) => ({ date, price }))
        .sort((a, b) => a.date.localeCompare(b.date));

    Promise.all([
      api.get(`/market/history/BIST?days=${days}`).then(r => toArray(r.data)).catch(() => []),
      api.get(`/market/history/USD?days=${days}`).then(r => toArray(r.data)).catch(() => []),
    ]).then(([bist, usd]) => setMarketData({ bist, usd }));
  }, [activeFilter]);

  // Ham değerleri birleştir (normalize etmeden)
  const chartData = useMemo(() => {
    const dateSet = new Set();
    const fundMaps = {};
    Object.entries(fundSeriesData).forEach(([code, data]) => {
      fundMaps[code] = {};
      data.forEach(d => { dateSet.add(d.date); fundMaps[code][d.date] = d.price; });
    });
    const bistMap = {};
    if (showBist) marketData.bist.forEach(d => { dateSet.add(d.date); bistMap[d.date] = d.price; });
    const usdMap = {};
    if (showUsd) marketData.usd.forEach(d => { dateSet.add(d.date); usdMap[d.date] = d.price; });

    return Array.from(dateSet).sort().map(date => {
      const point = { name: date };
      Object.entries(fundMaps).forEach(([code, map]) => { if (map[date] != null) point[code] = map[date]; });
      if (showBist && bistMap[date] != null) point['BIST 100'] = bistMap[date];
      if (showUsd  && usdMap[date]  != null) point['USD/TRY']  = usdMap[date];
      return point;
    });
  }, [fundSeriesData, marketData, showBist, showUsd]);
  const formatXAxis = (tickItem) => {
    if (!tickItem) return "";
    const date = new Date(tickItem);
    if (isNaN(date.getTime())) return tickItem;

    if (activeFilter === "1Y" || activeFilter === "6A") {
      return date.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' });
    }
    if (activeFilter === "3A" || activeFilter === "1A") {
      return date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
    }
    return date.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric' });
  };

  const getTickInterval = () => {
    const len = chartData.length;
    if (len <= 7) return 0;
    return Math.max(0, Math.ceil(len / 6) - 1);
  };

const calculatePerc = (profit, total) => {
    if (!total || total === 0 || profit === 0) return "0.00";
    return ((profit / total) * 100).toFixed(2);
};

  const adminFon = fonListesi.find(f => f.fundCode === user?.managedFundCode);
  const adminFonLot = adminFon?.totalLot ?? null;

  if (loading) return <div className="loading-screen"><div className="spinner"></div><p>Gerçek Zamanlı Veriler Bağlanıyor...</p></div>;

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-content">

          <div className="stats-grid">
            {[
              {
                t: "Şirket Fon Büyüklüğü",
                v: financials.sirketFonBuyuklugu,
                c: "#4f46e5",
                kzTl: financials.sirketKarZararTl,
                kzPct: calculatePerc(financials.sirketKarZararTl, financials.sirketFonBuyuklugu)
              },
              {
                t: "Şirket Kâr/Zarar",
                v: financials.sirketKarZararTl,
                p: calculatePerc(financials.sirketKarZararTl, financials.sirketFonBuyuklugu),
                c: "#10b981"
              },
              {
                t: `Fon Büyüklüğü (${user?.managedFundCode || 'HSF'})`,
                v: financials.fonBuyuklugu,
                c: "#6366f1",
                kzTl: financials.fonKarZararTl,
                kzPct: calculatePerc(financials.fonKarZararTl, financials.fonBuyuklugu)
              },
              {
                t: "Fon Kâr/Zarar",
                v: financials.fonKarZararTl,
                p: calculatePerc(financials.fonKarZararTl, financials.fonBuyuklugu),
                c: "#ef4444"
              }
            ].map((s, i) => (
              <div key={i} className="stat-card" style={{ borderTop: `4px solid ${s.c}` }}>
                <h3>{s.t}</h3>
                <p className="stat-value">₺{s.v?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
                {s.p && (
                  <span className={parseFloat(s.p) >= 0 ? "text-profit" : "text-loss"}>
                    {parseFloat(s.p) >= 0 ? '+' : ''}%{s.p}
                  </span>
                )}
                {s.kzTl !== undefined && Number(s.kzTl) !== 0 && (
                  <div style={{ marginTop: 8, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: parseFloat(s.kzTl) >= 0 ? '#26a69a' : '#ef5350' }}>
                      K/Z&nbsp;{parseFloat(s.kzTl) >= 0 ? '+' : ''}₺{Number(s.kzTl || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className={parseFloat(s.kzPct) >= 0 ? "text-profit" : "text-loss"}>
                      {parseFloat(s.kzPct) >= 0 ? '▲' : '▼'} %{s.kzPct}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {/* 5. Kart — Fon Toplam Lot */}
            <div className="stat-card" style={{ borderTop: '4px solid #8b5cf6' }}>
              <h3>TOPLAM LOT ({user?.managedFundCode || 'FON'})</h3>
              <p className="stat-value">
                {adminFonLot !== null
                  ? Number(adminFonLot).toLocaleString('tr-TR')
                  : '—'}
              </p>
              <span style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, display: 'block' }}>
                Fon Toplam Lot Adedi
              </span>
            </div>
          </div>

          <div className="chart-section">
            <div className="chart-header-row" style={{ flexWrap: 'wrap', gap: 12 }}>
              {/* Fon çoklu seçici */}
              <div style={{ position: 'relative' }}>
                <button className="fon-dropdown-btn" onClick={() => setFonDropdownOpen(o => !o)}>
                  {selectedFonlar && selectedFonlar.length > 0 ? selectedFonlar.join(', ') : 'Fon Seçin'}
                  <span style={{ marginLeft: 6, fontSize: 9 }}>▾</span>
                </button>
                {fonDropdownOpen && (
                  <div className="fon-dropdown-menu">
                    {fonListesi.map((f, i) => {
                      const code = f.fundCode || f.fundName;
                      const selected = selectedFonlar?.includes(code);
                      return (
                        <div key={i} className={`fon-dropdown-item ${selected ? 'selected' : ''}`} onClick={() => toggleFon(code)}>
                          <span className="fon-color-dot" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                          {f.fundName || code}
                          {selected && <span style={{ marginLeft: 'auto', color: '#10b981', fontSize: 12 }}>✓</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* BIST 100 + USD/TRY toggle */}
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  className={`karsilastirma-btn ${showBist ? 'active-bist' : ''}`}
                  onClick={() => setShowBist(v => !v)}
                >
                  ● BIST 100
                </button>
                <button
                  className={`karsilastirma-btn ${showUsd ? 'active-usd' : ''}`}
                  onClick={() => setShowUsd(v => !v)}
                >
                  ● USD/TRY
                </button>
              </div>

              <div className="time-filter-group">
                {["1H", "1A", "3A", "6A", "1Y"].map((f) => (
                  <button key={f} className={`filter-btn ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Seçili seri etiketleri */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              {(selectedFonlar || []).map((code, i) => (
                <span key={code} className="fon-chip" style={{ borderColor: CHART_COLORS[i % CHART_COLORS.length], color: CHART_COLORS[i % CHART_COLORS.length] }}>
                  {code}
                  <button className="fon-chip-remove" onClick={() => toggleFon(code)}>×</button>
                </span>
              ))}
              {showBist && marketData.bist.length > 0 && (
                <span className="fon-chip" style={{ borderColor: '#10b981', color: '#10b981' }}>BIST 100</span>
              )}
              {showUsd && marketData.usd.length > 0 && (
                <span className="fon-chip" style={{ borderColor: '#f59e0b', color: '#f59e0b' }}>USD/TRY</span>
              )}
              <span style={{ fontSize: 10, color: '#434651', alignSelf: 'center', fontFamily: 'JetBrains Mono, monospace' }}>
                Sol eksen: ₺ (fon) · Sağ eksen: piyasa
              </span>
            </div>

            <div style={{ width: '100%', height: 380 }}>
              <ResponsiveContainer>
                <AreaChart data={chartData}>
                  <defs>
                    {(selectedFonlar || []).map((code, i) => (
                      <linearGradient key={code} id={`color-${code}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.2}/>
                        <stop offset="95%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#2d3748"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickMargin={8}
                    tickFormatter={formatXAxis}
                    interval={getTickInterval()}
                    minTickGap={50}
                    axisLine={{ stroke: '#2d3748' }}
                    tickLine={false}
                  />
                  {/* Sol eksen — fon birim fiyatı (₺) */}
                  <YAxis
                    yAxisId="fund"
                    orientation="left"
                    stroke="#2d3748"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickFormatter={v => `₺${Number(v).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    domain={['auto', 'auto']}
                    width={80}
                    axisLine={false}
                    tickLine={false}
                  />
                  {/* Sağ eksen — BIST 100 (kendi ölçeği) */}
                  {showBist && marketData.bist.length > 0 && (
                    <YAxis
                      yAxisId="bist"
                      orientation="right"
                      stroke="#2d3748"
                      tick={{ fontSize: 10, fill: '#10b981' }}
                      tickFormatter={v => Number(v).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                      domain={['auto', 'auto']}
                      width={68}
                      axisLine={false}
                      tickLine={false}
                    />
                  )}
                  {/* USD/TRY ekseni — gizli, sadece ölçekleme için */}
                  {showUsd && marketData.usd.length > 0 && (
                    <YAxis yAxisId="usd" orientation="right" hide />
                  )}
                  <Tooltip
                    contentStyle={{ backgroundColor: '#161b2c', border: '1px solid #2a2e39', borderRadius: '10px', color: '#fff' }}
                    labelFormatter={label => {
                      const d = new Date(label);
                      return isNaN(d) ? label : d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
                    }}
                    formatter={(value, name) => {
                      if (name === 'BIST 100') return [Number(value).toLocaleString('tr-TR', { maximumFractionDigits: 0 }), name];
                      if (name === 'USD/TRY') return [`₺${Number(value).toFixed(4)}`, name];
                      return [`₺${Number(value).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`, name];
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8', paddingTop: 8 }} />

                  {/* Fon serileri — sol eksen */}
                  {(selectedFonlar || []).map((code, i) => (
                    <Area
                      key={code}
                      yAxisId="fund"
                      type="monotone"
                      dataKey={code}
                      name={code}
                      stroke={CHART_COLORS[i % CHART_COLORS.length]}
                      fill={`url(#color-${code})`}
                      fillOpacity={1}
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                    />
                  ))}

                  {/* BIST 100 — sağ eksen */}
                  {showBist && marketData.bist.length > 0 && (
                    <Area
                      yAxisId="bist"
                      type="monotone"
                      dataKey="BIST 100"
                      name="BIST 100"
                      stroke="#10b981"
                      fill="none"
                      strokeWidth={2}
                      strokeDasharray="6 3"
                      dot={false}
                      connectNulls
                    />
                  )}

                  {/* USD/TRY — kendi gizli ekseni */}
                  {showUsd && marketData.usd.length > 0 && (
                    <Area
                      yAxisId="usd"
                      type="monotone"
                      dataKey="USD/TRY"
                      name="USD/TRY"
                      stroke="#f59e0b"
                      fill="none"
                      strokeWidth={2}
                      strokeDasharray="6 3"
                      dot={false}
                      connectNulls
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="table-section">
            <h3>Tüm Fonların Detaylı Durumu</h3>
            <table className="fon-table">
              <thead>
                <tr>
                  <th>Fon Adı</th>
                  <th>Kâr/Zarar (%)</th>
                  <th>Danışman</th>
                  <th>Yatırımcı</th>
                  <th>Birim Değer</th>
                  <th>Toplam Lot</th>
                </tr>
              </thead>
              <tbody>
                {fonListesi.map((f, idx) => (
                  <tr key={idx}>
                    <td>{f.fundName}</td>
                    <td className={f.profitLossPercentage >= 0 ? 'text-profit' : 'text-loss'}>
                      {f.profitLossPercentage >= 0 ? '+' : ''}%{f.profitLossPercentage}
                    </td>
                    <td>{f.advisorCount}</td>
                    <td>{f.investorCount}</td>
                    <td>₺{f.currentPrice?.toFixed(2)}</td>
                    <td>{f.totalLot?.toLocaleString('tr-TR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminAnasayfa;
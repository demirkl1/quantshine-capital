import React, { useState, useEffect } from 'react';
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
  const [multiChartData, setMultiChartData] = useState([]);
  const [fonDropdownOpen, setFonDropdownOpen] = useState(false);

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

  // Multi-fund chart — seçili fonlar veya filtre değişince
  useEffect(() => {
    const fetchMultiChart = async () => {
      if (!token || !selectedFonlar || selectedFonlar.length === 0) return;
      try {
        const results = await Promise.all(
          selectedFonlar.map(code =>
            api.get(`/funds/history/${code}?filter=${activeFilter}`)
              .then(res => ({ code, data: res.data }))
              .catch(() => ({ code, data: [] }))
          )
        );
        const dateMap = {};
        results.forEach(({ code, data }) => {
          data.forEach(item => {
            const key = item.date;
            if (!dateMap[key]) dateMap[key] = { name: key };
            dateMap[key][code] = item.price;
          });
        });
        setMultiChartData(Object.values(dateMap).sort((a, b) => new Date(a.name) - new Date(b.name)));
      } catch (e) { console.error("Multi-chart hatası:", e); }
    };
    fetchMultiChart();
  }, [token, selectedFonlar, activeFilter]);
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
    const len = multiChartData.length;
    if (len <= 7) return 0;
    return Math.max(0, Math.ceil(len / 6) - 1);
  };

const calculatePerc = (profit, total) => {
    if (!total || total === 0 || profit === 0) return "0.00";
    return ((profit / total) * 100).toFixed(2);
};

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
          </div>

          <div className="chart-section">
            <div className="chart-header-row" style={{ flexWrap: 'wrap', gap: 12 }}>
              {/* Fon çoklu seçici */}
              <div style={{ position: 'relative' }}>
                <button
                  className="fon-dropdown-btn"
                  onClick={() => setFonDropdownOpen(o => !o)}
                >
                  {selectedFonlar && selectedFonlar.length > 0
                    ? selectedFonlar.join(', ')
                    : 'Fon Seçin'}
                  <span style={{ marginLeft: 6, fontSize: 9 }}>▾</span>
                </button>
                {fonDropdownOpen && (
                  <div className="fon-dropdown-menu">
                    {fonListesi.map((f, i) => {
                      const code = f.fundCode || f.fundName;
                      const selected = selectedFonlar?.includes(code);
                      return (
                        <div
                          key={i}
                          className={`fon-dropdown-item ${selected ? 'selected' : ''}`}
                          onClick={() => toggleFon(code)}
                        >
                          <span
                            className="fon-color-dot"
                            style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                          />
                          {f.fundName || code}
                          {selected && <span style={{ marginLeft: 'auto', color: '#10b981', fontSize: 12 }}>✓</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="time-filter-group">
                {["1H", "1A", "3A", "6A", "1Y"].map((f) => (
                  <button key={f} className={`filter-btn ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Seçili fon etiketleri */}
            {selectedFonlar && selectedFonlar.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                {selectedFonlar.map((code, i) => (
                  <span key={code} className="fon-chip" style={{ borderColor: CHART_COLORS[i % CHART_COLORS.length], color: CHART_COLORS[i % CHART_COLORS.length] }}>
                    {code}
                    <button className="fon-chip-remove" onClick={() => toggleFon(code)}>×</button>
                  </span>
                ))}
              </div>
            )}

            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <AreaChart data={multiChartData}>
                  <defs>
                    {(selectedFonlar || []).map((code, i) => (
                      <linearGradient key={code} id={`color-${code}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.25}/>
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
                  <YAxis
                    stroke="#2d3748"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickFormatter={(v) => {
                      if (v >= 1_000_000) return `₺${(v / 1_000_000).toFixed(1)}M`;
                      if (v >= 1_000) return `₺${(v / 1_000).toFixed(1)}K`;
                      return `₺${v.toFixed(2)}`;
                    }}
                    domain={['auto', 'auto']}
                    width={75}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#161b2c', border: 'none', borderRadius: '10px', color: '#fff' }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    formatter={(value, name) => [`₺${Number(value).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, name]}
                  />
                  {(selectedFonlar || []).length > 1 && (
                    <Legend
                      wrapperStyle={{ fontSize: 11, color: '#94a3b8', paddingTop: 8 }}
                      formatter={(value) => value}
                    />
                  )}
                  {(selectedFonlar || []).map((code, i) => (
                    <Area
                      key={code}
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
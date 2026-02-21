import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './AdminAnasayfa.css';

const AdminAnasayfa = () => {
  const { token, user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("1A");
  const [loading, setLoading] = useState(true);
  const [selectedChartFon, setSelectedChartFon] = useState("HSF");

  const [financials, setFinancials] = useState({
    sirketFonBuyuklugu: 0,
    sirketKarZararTl: 0,
    fonBuyuklugu: 0,
    fonKarZararTl: 0
  });
  const [fonListesi, setFonListesi] = useState([]);
  const [grafikVerisi, setGrafikVerisi] = useState([]);

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

  // Grafik + fon listesi — filtre veya kullanıcı değişince yenilenir
  useEffect(() => {
    const fetchChartAndFunds = async () => {
      if (!token) return;
      try {
        const res = await api.get(`/funds/history/${user?.managedFundCode || 'HSF'}?filter=${activeFilter}`);
        setGrafikVerisi(res.data.map(item => ({ name: item.date, fiyat: item.price })));
      } catch (e) { console.error("Grafik API Hatası:", e.message); }

      try {
        const res = await api.get('/funds/all-details');
        setFonListesi(res.data);
      } catch (e) { console.error("Tablo API Hatası:", e.message); }

      setLoading(false);
    };

    fetchChartAndFunds();
  }, [token, user, activeFilter]);
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
    const len = grafikVerisi.length;
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
            <div className="chart-header-row">
              <h3>{user?.managedFundCode || 'HSF'} - Portföy Değeri Gelişimi</h3>
              <div className="time-filter-group">
                {["1H", "1A", "3A", "6A", "1Y"].map((f) => (
                  <button key={f} className={`filter-btn ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <AreaChart data={grafikVerisi}>
                  <defs>
                    <linearGradient id="colorAdmin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
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
  formatter={(value) => [`₺${value.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, "Birim Fiyat"]}
/>
                  <Area type="monotone" dataKey="fiyat" stroke="#4f46e5" fillOpacity={1} fill="url(#colorAdmin)" strokeWidth={3} />
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
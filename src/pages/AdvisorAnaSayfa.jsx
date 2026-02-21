import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import AdvisorSidebar from '../components/AdvisorSidebar';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './AdvisorAnaSayfa.css';

const AdvisorAnaSayfa = () => {
  const { token } = useAuth();
  const [activeFilter, setActiveFilter] = useState("1A");
  const [loading, setLoading] = useState(true);
  const [realFundCode, setRealFundCode] = useState(null);

  const [stats, setStats] = useState({
    sorumluFonBuyuklugu: 0,
    fonKarZararTl: 0,
    fonKarZararYuzde: "0.00"
  });
  const [chartData, setChartData] = useState([]);

  // İlk yüklemede backend'den gerçek fon kodunu çek
  useEffect(() => {
    const fetchFundCode = async () => {
      if (!token) return;
      try {
        const { data: backendUser } = await api.get('/users/me');
        setRealFundCode(backendUser.managedFundCode || null);
      } catch (err) {
        console.error("Kullanıcı bilgisi alınamadı:", err.message);
      }
    };
    fetchFundCode();
  }, [token]);

  // Fon kodu veya filtre değiştiğinde grafik ve istatistikleri güncelle
  // Stats (portföy değeri + K/Z) — her 60 saniyede bir yenilenir
  useEffect(() => {
    const fetchStats = async () => {
      if (!token || !realFundCode) return;
      try {
        const res = await api.get('/trade/advisor-stats');
        setStats(res.data);
      } catch (err) {
        console.error("Stats Hatası:", err.response?.data || err.message);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [token, realFundCode]);

  // Grafik verisi — filtre veya fon kodu değişince yenilenir
  useEffect(() => {
    const fetchChart = async () => {
      if (!token || !realFundCode) return;
      try {
        const res = await api.get(`/funds/history/${realFundCode}?filter=${activeFilter}`);
        setChartData(res.data.map(item => ({ name: item.date, fiyat: item.price })));
      } catch (err) {
        console.error("Grafik Hatası:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChart();
  }, [token, realFundCode, activeFilter]);

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

  if (loading) return <div className="loading-screen"><div className="spinner"></div><p>Portföy Verileri Getiriliyor...</p></div>;

return (
    <div className="admin-wrapper">
      <AdvisorSidebar />
      <main className="admin-main">
        <div className="admin-content">
          
          <div className="advisor-stats-grid">
            <div className="stat-card" style={{ borderTop: `4px solid #4f46e5` }}>
              <h3>SORUMLU FON BÜYÜKLÜĞÜ</h3>
              <p className="stat-value">
                ₺{stats.sorumluFonBuyuklugu?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </p>
              {parseFloat(stats.fonKarZararTl) !== 0 && (
                <div style={{ marginTop: 8, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: parseFloat(stats.fonKarZararTl) >= 0 ? '#26a69a' : '#ef5350' }}>
                    K/Z&nbsp;{parseFloat(stats.fonKarZararTl) >= 0 ? '+' : ''}₺{Number(stats.fonKarZararTl || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className={parseFloat(stats.fonKarZararYuzde) >= 0 ? "text-profit" : "text-loss"}>
                    {parseFloat(stats.fonKarZararYuzde) >= 0 ? '▲' : '▼'} %{stats.fonKarZararYuzde}
                  </span>
                </div>
              )}
            </div>

            <div className="stat-card" style={{ borderTop: `4px solid ${parseFloat(stats.fonKarZararYuzde) >= 0 ? '#10b981' : '#ef4444'}` }}>
              <h3>FON KÂR/ZARAR</h3>
              <p className="stat-value">
                {parseFloat(stats.fonKarZararTl) >= 0 ? '+' : ''}
                ₺{stats.fonKarZararTl?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </p>
              <span className={parseFloat(stats.fonKarZararYuzde) >= 0 ? "text-profit" : "text-loss"}>
                {parseFloat(stats.fonKarZararYuzde) >= 0 ? '▲' : '▼'} %{stats.fonKarZararYuzde}
              </span>
            </div>
          </div>

          <div className="chart-section">
            <div className="chart-header">
              <div className="header-left">
                <h3>{realFundCode || 'FON'} - Fon Fiyatı Gelişimi</h3>
                <span className="live-indicator">● CANLI VERİ</span>
              </div>

              <div className="time-filter-group">
                {["1H", "1A", "3A", "6A", "1Y"].map((f) => (
                  <button 
                    key={f} 
                    className={`filter-btn ${activeFilter === f ? 'active' : ''}`} 
                    onClick={() => setActiveFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
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
                    domain={['auto', 'auto']}
                    tickFormatter={(value) => `₺${parseFloat(value).toFixed(2)}`}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    width={70}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#161b2c', 
                      border: '1px solid #4f46e5', 
                      borderRadius: '10px', 
                      color: '#fff' 
                    }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    formatter={(value) => [`₺${parseFloat(value).toFixed(4)}`, "Birim Fiyat"]}
                  />
                  
                  <Area
                    type="monotone"
                    dataKey="fiyat"
                    stroke="#4f46e5"
                    fillOpacity={1} 
                    fill="url(#colorPrice)" 
                    strokeWidth={3} 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdvisorAnaSayfa;
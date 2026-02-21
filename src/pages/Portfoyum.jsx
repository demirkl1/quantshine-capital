import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import InvestorSidebar from '../components/InvestorSidebar';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Portfoyum.css';

const Portfoyum = () => {
  const { token, user } = useAuth();
  const [myFunds, setMyFunds] = useState([]);
  const [selectedFon, setSelectedFon] = useState("");
  const [activeFilter, setActiveFilter] = useState("1A");
  const [loading, setLoading] = useState(true);

  // Kartlardaki istatistik verileri
  const [stats, setStats] = useState({
    toplamLot: 0,
    karZararTl: 0,
    guncelDeger: 0,
    toplamPortfoyBuyuklugu: 0
  });
  const [chartData, setChartData] = useState([]);

  // 1. ADIM: Sayfa açıldığında yatırımcının fon listesini çekiyoruz
  useEffect(() => {
    const fetchMyFunds = async () => {
      if (!token) return;
      try {
        const res = await api.get('/trade/my-funds');
        setMyFunds(res.data);
        
        // Eğer fonu varsa ilkini otomatik seç
        if (res.data.length > 0 && !selectedFon) {
          setSelectedFon(res.data[0]);
        } else if (res.data.length === 0) {
          setLoading(false);
        }
      } catch (err) {
        console.error("Fon listesi çekilemedi:", err);
        setLoading(false);
      }
    };
    fetchMyFunds();
  }, [token]);

  useEffect(() => {
    const fetchPortfolioDetails = async () => {
      if (!token || !selectedFon) return;
      
      setLoading(true);
      try {
        const statsRes = await api.get(`/trade/investor-portfolio?fundCode=${selectedFon}`);
        setStats(statsRes.data);

        const chartRes = await api.get(`/funds/${selectedFon}/history?filter=${activeFilter}`);

const formattedData = chartRes.data.map(item => ({
  tarih: item.name,
  deger: item.fiyat
}));

setChartData(formattedData);

      } catch (err) {
        console.error("Veri çekme hatası:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioDetails();
  }, [token, selectedFon, activeFilter]);

  // Fon bazlı renk yönetimi
  const getFonColor = (code) => {
    const colors = { "TEK": "#4f46e5", "HSF": "#10b981", "ALTIN": "#f59e0b" };
    return colors[code] || "#4f46e5";
  };

  const getTickInterval = () => {
    const len = chartData.length;
    if (len <= 7) return 0;
    return Math.max(0, Math.ceil(len / 6) - 1);
  };

  if (loading && myFunds.length > 0) return <div className="loading">Veriler Yükleniyor...</div>;

  return (
    <div className="admin-wrapper">
      <InvestorSidebar />
      <main className="admin-main">
        <header className="page-header">
          <h1>Portföyüm</h1>
          <div className="fon-selector-container">
            <label>İncelemek İstediğiniz Fonu Seçin:</label>
            <select 
              className="combobox" 
              value={selectedFon} 
              onChange={(e) => setSelectedFon(e.target.value)}
            >
              {myFunds.length > 0 ? (
                myFunds.map(code => (
                  <option key={code} value={code}>{code} Fonu</option>
                ))
              ) : (
                <option value="">Yatırım Bulunmuyor</option>
              )}
            </select>
          </div>
        </header>

        <div className="admin-content">
          <div className="stats-grid">
  <div className="stat-card" style={{ borderTop: `4px solid ${getFonColor(selectedFon)}` }}>
    <h3>TOPLAM LOT (SEÇİLİ FON)</h3>
    <p className="stat-value">{stats.toplamLot?.toLocaleString('tr-TR')}</p>
  </div>

  <div className="stat-card" style={{ borderTop: `4px solid ${getFonColor(selectedFon)}` }}>
    <h3>KÂR / ZARAR (SEÇİLİ FON)</h3>
    <p className={`stat-value ${parseFloat(stats.karZararTl) >= 0 ? 'text-profit' : 'text-loss'}`}>
      {parseFloat(stats.karZararTl) >= 0 ? '+' : ''}₺{stats.karZararTl?.toLocaleString('tr-TR')}
    </p>
    <span className={parseFloat(stats.karZararYuzde) >= 0 ? "text-profit" : "text-loss"}>
      {parseFloat(stats.karZararYuzde) >= 0 ? '▲' : '▼'} %{stats.karZararYuzde}
    </span>
  </div>

  <div className="stat-card" style={{ borderTop: `4px solid ${getFonColor(selectedFon)}` }}>
    <h3>PORTFÖY BÜYÜKLÜĞÜ</h3>
    <p className="stat-value">₺{stats.guncelDeger?.toLocaleString('tr-TR')}</p>
  </div>

  <div className="stat-card static-card">
    <h3>TOPLAM KÂR / ZARAR (GENEL)</h3>
    <p className={`stat-value ${parseFloat(stats.genelKarZararYuzde) >= 0 ? 'text-profit' : 'text-loss'}`}>
      ₺{(stats.toplamPortfoyBuyuklugu - (stats.toplamMaliyet || 0))?.toLocaleString('tr-TR')}
    </p>
    <span className={parseFloat(stats.genelKarZararYuzde) >= 0 ? "text-profit" : "text-loss"}>
      {parseFloat(stats.genelKarZararYuzde) >= 0 ? '▲' : '▼'} %{stats.genelKarZararYuzde}
    </span>
  </div>
</div>

          {/* Grafik Bölümü */}
          <div className="chart-section">
            <div className="chart-header-row">
              <h3>{selectedFon} FONU DEĞER GRAFİĞİ</h3>
              <div className="time-filter-group">
                {["1H", "1A", "3A", "6A", "1Y"].map((f) => (
                  <button
                    key={f}
                    className={`filter-btn ${activeFilter === f ? 'active' : ''}`}
                    style={activeFilter === f ? { backgroundColor: getFonColor(selectedFon) } : {}}
                    onClick={() => setActiveFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
               <AreaChart data={chartData}>
  <defs>
    <linearGradient id="colorFiyat" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={getFonColor(selectedFon)} stopOpacity={0.3}/>
      <stop offset="95%" stopColor={getFonColor(selectedFon)} stopOpacity={0}/>
    </linearGradient>
  </defs>
  
  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />

  <XAxis
    dataKey="tarih"
    stroke="#2d3748"
    tick={{ fontSize: 11, fill: '#94a3b8' }}
    tickMargin={8}
    interval={getTickInterval()}
    minTickGap={50}
    axisLine={{ stroke: '#2d3748' }}
    tickLine={false}
  />

  <YAxis
    stroke="#2d3748"
    domain={['auto', 'auto']}
    tickFormatter={(v) => `₺${parseFloat(v).toFixed(2)}`}
    tick={{ fontSize: 11, fill: '#94a3b8' }}
    width={70}
    axisLine={false}
    tickLine={false}
  />

  <Tooltip
    contentStyle={{ backgroundColor: '#161b2c', border: '1px solid #2d3748', borderRadius: '10px', color: '#fff' }}
    labelStyle={{ color: '#94a3b8', marginBottom: 4 }}
    formatter={(value) => [`₺${parseFloat(value).toFixed(4)}`, "Birim Fiyat"]}
  />

  <Area
    type="monotone"
    dataKey="deger"
    stroke={getFonColor(selectedFon)}
    fillOpacity={1} 
    fill="url(#colorFiyat)" 
    strokeWidth={3} 
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

export default Portfoyum;
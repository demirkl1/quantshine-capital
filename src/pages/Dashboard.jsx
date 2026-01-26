import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import Chart from "react-apexcharts";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../context/ThemeContext";

const Dashboard = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();

  const [dashboardData, setDashboardData] = useState({
    totalLots: 0,
    portfolioValue: 0,
    totalProfit: 0,
    profitRate: 0
  });

  const [chartData, setChartData] = useState([]);
  const [chartDates, setChartDates] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [transactions, setTransactions] = useState([]);

  // 🚀 DİNAMİK KULLANICI YAKALAMA
  const activeUserEmail = user?.email || localStorage.getItem('userEmail');
  //const activeUserEmail = "ecem@gmail.com";
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const fetchDashboardData = async () => {
    if (!activeUserEmail) return;

    // 🚀 KRİTİK: Yeni veriyi çekmeden önce ekranı sıfırla!
    setDashboardData({ totalLots: 0, portfolioValue: 0, totalProfit: 0, profitRate: 0 });
    setTransactions([]);

    try {
      const timestamp = new Date().getTime();
      const resDash = await fetch(`http://localhost:8081/api/portfolio/dashboard/${activeUserEmail}?t=${timestamp}`);

      if (resDash.ok) {
        const data = await resDash.json();
        // Eğer backend'den veri gelmişse set et
        setDashboardData({
          totalLots: data.totalLots || 0,
          portfolioValue: data.portfolioValue || 0,
          totalProfit: data.totalProfit || 0,
          profitRate: data.profitRate || 0
        });
      }
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    }
  };
  const fetchChartHistory = async (days) => {
    try {
      const response = await fetch(`http://localhost:8081/api/portfolio/history?days=${days}`);
      if (response.ok) {
        const data = await response.json();
        setChartData(data.map(item => item.price));
        setChartDates(data.map(item => {
          const d = new Date(item.date);
          return `${d.getDate()} ${d.toLocaleString('tr-TR', { month: 'short' })}`;
        }));
      }
    } catch (error) {
      console.error("Grafik hatası:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchChartHistory(selectedPeriod);
  }, [activeUserEmail, selectedPeriod]); // 🚀 Email veya periyot değişince tetiklenir

  const formatCurrency = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);
  const formatDate = (dateStr) => new Date(dateStr).toLocaleString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  // --- GRAFİK AYARLARI ---
  const chartSeries = [{ name: "Fon Birim Fiyatı (₺)", data: chartData }];
  const chartOptions = {
    chart: { id: "fund-chart", toolbar: { show: false }, background: 'transparent' },
    xaxis: { categories: chartDates, labels: { style: { colors: isDark ? '#cbd5e1' : '#334155' } } },
    yaxis: { labels: { style: { colors: isDark ? '#cbd5e1' : '#334155' }, formatter: (val) => val.toFixed(4) } },
    stroke: { curve: "smooth", width: 3 },
    tooltip: { theme: isDark ? "dark" : "light" }
  };

  return (
    <div className={`dashboard-wrapper ${isDark ? "dark" : ""}`}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <main className={`dashboard-main ${isSidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}>
        <header className="dashboard-header">
          <div className="header-left"><h1 className="dashboard-title">Portföyüm</h1></div>
          <div className="header-right">
            <button className="theme-toggle" onClick={toggleTheme}>{isDark ? "☀️" : "🌙"}</button>
            <div className="user-profile">
              <img src="https://i.pravatar.cc/35" alt="User" className="avatar" />
              {/* 🚀 DİNAMİK İSİM */}
              <span>{user?.ad ? `${user.ad} ${user.soyad}` : "Yatırımcı"}</span>
            </div>
          </div>
        </header>

        <section className="overview-cards-container">
          <div className="stat-card">
            <p className="card-title">Toplam Lot Sayısı</p>
            <h3 className="card-value">{dashboardData.totalLots.toLocaleString()}</h3>
            <p className="card-percentage positive">Adet</p>
          </div>
          <div className="stat-card">
            <p className="card-title">Portföy Büyüklüğü</p>
            <h3 className="card-value">{formatCurrency(dashboardData.portfolioValue)}</h3>
            <p className="card-percentage positive">Güncel Değer</p>
          </div>
          <div className="stat-card">
            <p className="card-title">Toplam Kar/Zarar</p>
            <h3 className="card-value" style={{ color: dashboardData.totalProfit >= 0 ? '#10b981' : '#ef4444' }}>
              {formatCurrency(dashboardData.totalProfit)}
            </h3>
            <p className={`card-percentage ${dashboardData.profitRate >= 0 ? 'positive' : 'negative'}`}>
              %{dashboardData.profitRate.toFixed(2)} Getiri
            </p>
          </div>
        </section>

        <section className="chart-section">
          <div className="period-btns">
            {[7, 30, 90, 365].map(p => (
              <button
                key={p}
                onClick={() => setSelectedPeriod(p)}
                className={selectedPeriod === p ? "active-period" : ""}
              >
                {p === 365 ? '1Y' : p === 30 ? '1A' : p === 7 ? '1H' : '3A'}
              </button>
            ))}
          </div>
          <Chart options={chartOptions} series={chartSeries} type="area" height={300} />
        </section>


      </main>
    </div>
  );
};

export default Dashboard;
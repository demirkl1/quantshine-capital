import React from "react";
import "./Dashboard.css";
import Chart from "react-apexcharts";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../context/ThemeContext";

const Dashboard = () => {
  const { theme, toggleTheme } = useTheme(); // ✅ Global tema durumu
  const isDark = theme === "dark";
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);
  const { user } = useAuth();

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  // Yapay veri
  const chartData = [
    { month: "Jan", value: 12000 },
    { month: "Feb", value: 14000 },
    { month: "Mar", value: 13500 },
    { month: "Apr", value: 15000 },
    { month: "May", value: 15500 },
    { month: "Jun", value: 16000 },
  ];

  const series = [{ name: "Fon Performansı", data: chartData.map((d) => d.value) }];

  const options = {
    chart: { id: "fund-chart", toolbar: { show: false }, zoom: { enabled: false } },
    xaxis: { categories: chartData.map((d) => d.month) },
    stroke: { curve: "smooth", width: 3 },
    fill: { type: "gradient", gradient: { shade: "light", opacityFrom: 0.7, opacityTo: 0.2 } },
    tooltip: { theme: isDark ? "dark" : "light" },
  };

  return (
    <div className={`dashboard-wrapper ${isDark ? "dark" : ""}`}>
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <main className={`dashboard-main ${isSidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}>
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <h1 className="dashboard-title">Portföyüm</h1>
          </div>

          <div className="header-right">
            {/* ✅ Global tema butonu */}
            <button className="theme-toggle" onClick={toggleTheme}>
              {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>

            <div className="user-profile">
              <img src="https://i.pravatar.cc/35" alt="User" className="avatar" />
              <span>{user ? `${user.name} ${user.surname}` : "Misafir"}</span>
            </div>
          </div>
        </header>

        {/* Welcome */}
        <section className="welcome-section">
          <h2>Hoşgeldin, {user ? user.name : "Investor"}!</h2>
        </section>

        {/* Kartlar */}
        <section className="overview-cards-container">
          <div className="stat-card">
            <p className="card-title">Yatırımcı Toplam Lot Sayısı</p>
            <h3 className="card-value">325</h3>
            <p className="card-percentage positive">+12.4%</p>
          </div>
          <div className="stat-card">
            <p className="card-title">Portföy Büyüklüğü (TL)</p>
            <h3 className="card-value">120.000</h3>
            <p className="card-percentage positive">+3.2%</p>
          </div>
          <div className="stat-card">
            <p className="card-title">Toplam Kar/Zarar (TL)</p>
            <h3 className="card-value">150.000</h3>
            <p className="card-percentage positive">+5.4%</p>
          </div>
        </section>

        {/* Grafik */}
        <section className="chart-section">
          <h3>Fon Değer Grafiği</h3>
          <div className="chart-wrapper">
            <Chart options={options} series={series} type="line" height={250} />
          </div>
        </section>

        {/* Tablo */}
        <section className="table-section">
          <div className="table-header">
            <h3>Özet Bölüm</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>Toplam Yatırım</th>
                <th>Toplam Lot</th>
                <th>Güncel Değer</th>
                <th>Kar/Zarar (TL)</th>
                <th>Kar/Zarar (%)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>150.000 TL</td>
                <td>150 LOT</td>
                <td>1.000 TL</td>
                <td>50.000 TL</td>
                <td>%50</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;

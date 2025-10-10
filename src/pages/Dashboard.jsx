import React, { useState } from "react";
import "./Dashboard.css";
import Chart from "react-apexcharts";
import { useAuth } from "../context/AuthContext"; // AuthContext

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const { user } = useAuth(); 

  const toggleTheme = () => setDarkMode(!darkMode);

  // Yapay veriler
  const chartData = [
    { month: "Jan", value: 12000 },
    { month: "Feb", value: 14000 },
    { month: "Mar", value: 13500 },
    { month: "Apr", value: 15000 },
    { month: "May", value: 15500 },
    { month: "Jun", value: 16000 },
  ];

  const series = [
    {
      name: "Fund Performance",
      data: chartData.map((d) => d.value),
    },
  ];

  const options = {
    chart: {
      id: "fund-chart",
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: true },
    },
    xaxis: {
      categories: chartData.map((d) => d.month),
      labels: { style: { colors: "#888", fontSize: "12px" } },
    },
    stroke: { curve: "smooth", width: 3 },
    fill: {
      type: "gradient",
      gradient: { shade: "light", type: "vertical", opacityFrom: 0.7, opacityTo: 0.2 },
    },
    tooltip: { theme: darkMode ? "dark" : "light" },
  };

  return (
    <div className={`dashboard-container ${darkMode ? "dark" : ""}`}>
      <aside className="sidebar">
        <div className="sidebar-header">QuantShine Capital</div>
        <nav className="sidebar-nav">
          <ul>
            <li><a href="#" className="active">Dashboard</a></li>
            <li><a href="#">Investors</a></li>
            <li><a href="#">Transactions</a></li>
            <li><a href="#">Reports</a></li>
            <li><a href="#">Settings</a></li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <header className="dashboard-header">
          <h1 className="dashboard-title">Dashboard Overview</h1>
          <div className="header-right">
            <button className="theme-toggle" onClick={toggleTheme}>
              {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
            <div className="user-profile">
              <img src="https://i.pravatar.cc/35" alt="User" className="avatar" />
              <span>{user ? `${user.name} ${user.surname}` : "Misafir"}</span>
            </div>
          </div>
        </header>

        <section className="welcome-section">
          <h2>Welcome back, {user ? user.name : "Investor"}!</h2>
        </section>

        <section className="overview-cards-container">
          <div className="stat-card">
            <p className="card-title">Total Investors</p>
            <h3 className="card-value">325</h3>
            <p className="card-percentage positive">+12.4%</p>
          </div>
          <div className="stat-card">
            <p className="card-title">Active Funds</p>
            <h3 className="card-value">18</h3>
            <p className="card-percentage positive">+3.2%</p>
          </div>
          <div className="stat-card">
            <p className="card-title">Monthly Revenue</p>
            <h3 className="card-value">$42,000</h3>
            <p className="card-percentage negative">-2.1%</p>
          </div>
        </section>

        <section className="chart-section">
          <h3>Fund Performance</h3>
          <div className="chart-wrapper">
            <Chart options={options} series={series} type="line" height={250} />
          </div>
        </section>

        <section className="table-section">
          <div className="table-header">
            <h3>Investor Management</h3>
            <div className="table-actions">
              <input type="text" placeholder="Search investor..." className="search-input" />
              <button className="add-btn">+ Add Investor</button>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Investment</th>
                <th>Return</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>John Doe</td>
                <td>$10,000</td>
                <td>+12%</td>
                <td><span className="status active">Active</span></td>
              </tr>
              <tr>
                <td>Sarah Smith</td>
                <td>$8,500</td>
                <td>+9%</td>
                <td><span className="status active">Active</span></td>
              </tr>
              <tr>
                <td>Michael Green</td>
                <td>$12,000</td>
                <td>-3%</td>
                <td><span className="status inactive">Inactive</span></td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;

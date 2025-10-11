import React, { useState } from "react";
import "./YatirimGecmisi.css";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

const YatirimGecmisi = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const toggleTheme = () => setDarkMode(!darkMode);

  const investmentData = [
    { date: "2025-01-10", amount: 10000, lots: 10, fundValueAtDate: 1000, currentFundValue: 1200 },
    { date: "2025-02-05", amount: 5000, lots: 5, fundValueAtDate: 1050, currentFundValue: 1200 },
    { date: "2025-03-20", amount: 15000, lots: 15, fundValueAtDate: 1100, currentFundValue: 1200 },
  ];

  return (
    <div className={`dashboard-wrapper ${darkMode ? "dark" : ""}`}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className={`dashboard-main ${isSidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}>
        <header className="dashboard-header">
          <h1 className="dashboard-title">Yatırım Geçmişim</h1>
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

        <section className="table-section">
          <div className="table-header">
            <h3>Yatırımlar</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Yatırım Tutarı (TL)</th>
                <th>Alınan Lot</th>
                <th>O Tarihteki Fon Değeri</th>
                <th>Şuanki Fon Değeri</th>
              </tr>
            </thead>
            <tbody>
              {investmentData.map((inv, idx) => (
                <tr key={idx}>
                  <td>{inv.date}</td>
                  <td>{inv.amount.toLocaleString()}</td>
                  <td>{inv.lots}</td>
                  <td>{inv.fundValueAtDate.toLocaleString()}</td>
                  <td>{inv.currentFundValue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
};

export default YatirimGecmisi;

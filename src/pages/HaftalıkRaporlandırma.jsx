import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import "./HaftalıkRaporlandırma.css";

const HaftalikRaporlandırma = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();

  const toggleTheme = () => setDarkMode(!darkMode);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  // Müşteri/patron kontrolü için örnek (true = patron)
  const isPatron = user?.role === "patron";

  return (
    <div className={`rapor-wrapper ${darkMode ? "dark" : ""}`}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <main className={`rapor-main ${isSidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}>
        <header className="rapor-header">
          <h1>Haftalık Raporlar</h1>
          <div className="header-right">
            <button className="theme-toggle" onClick={toggleTheme}>
              {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
            <div className="user-profile">
              <img
                src="https://i.pravatar.cc/35"
                alt="User"
                className="avatar"
              />
              <span>{user ? `${user.name} ${user.surname}` : "Misafir"}</span>
            </div>
          </div>
        </header>

        <section className="stat-cards-container">
          <div className="stat-card">
            <p className="card-title">Haftalık Rapor</p>
            <textarea
              readOnly={!isPatron}
              placeholder={isPatron ? "Raporunuzu buraya yazın..." : "Bu alan sadece görüntülenebilir."}
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default HaftalikRaporlandırma;

import React from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import "./HaftalıkRaporlandırma.css";
import { useTheme } from "../context/ThemeContext";


const HaftalikRaporlandırma = () => {
  const { theme, toggleTheme } = useTheme(); // ✅ Global tema durumu
  const isDark = theme === "dark";
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);
  const { user } = useAuth();

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  // Müşteri/patron kontrolü (örnek)
  const isPatron = user?.role === "patron";

  return (
    <div className={`rapor-wrapper ${isDark ? "dark" : ""}`}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <main className={`rapor-main ${isSidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}>
        <header className="rapor-header">
          <h1>Haftalık Raporlar</h1>

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

        <section className="stat-cards-container">
          <div className="stat-card">
            <p className="card-title">Haftalık Rapor</p>
            <textarea
              readOnly={!isPatron}
              placeholder={
                isPatron
                  ? "Raporunuzu buraya yazın..."
                  : "Bu alan sadece görüntülenebilir."
              }
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default HaftalikRaporlandırma;

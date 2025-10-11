import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import "./DanismanBilgileri.css";

const DanismanBilgileri = () => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleTheme = () => setDarkMode(!darkMode);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <div className={`danisman-wrapper ${darkMode ? "dark" : ""}`}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <main className={`danisman-main ${isSidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}>
        <header className="danisman-header">
          <h1>Danışman Bilgileri</h1>
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

       <section className="stat-cards-container">
  {/* Yapay Kart */}
  <div className="stat-card">
    <p className="card-title">Açıklama</p>
    <textarea
      readOnly
      value="Bu alan sadece görüntülenebilir."
    />
  </div>

  {/* Danışman Bilgileri Kart */}
  <div className="stat-card">
    <p className="card-title">Danışman Bilgileri</p>
    <div className="card-content">
      <div className="advisor-profile">
        <img
          src="https://i.pravatar.cc/100"
          alt="Danışman"
          className="advisor-avatar"
        />
        <div className="advisor-details">
          <p><strong>İsim Soyisim:</strong> John Doe</p>
          <p><strong>Telefon:</strong> +90 555 123 45 67</p>
          <p><strong>Email:</strong> john.doe@example.com</p>
        </div>
      </div>
    </div>
  </div>
</section>

      </main>
    </div>
  );
};

export default DanismanBilgileri;

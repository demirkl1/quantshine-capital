import React, { useState, useEffect } from "react";
import axios from "axios"; // API çağrıları için
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import "./DanismanBilgileri.css";

const DanismanBilgileri = () => {
  const { user } = useAuth(); // Yatırımcının kimliği (kendi maili)
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // ⭐️ YENİ STATE'LER
  const [advisorInfo, setAdvisorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    // ⭐️ Backend'den danışman bilgilerini çeken fonksiyon
    const fetchAdvisorInfo = async () => {
        if (!user || !user.email) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Yatırımcının kendi e-postasını göndererek atanan danışmanın bilgilerini isteriz.
            const response = await axios.post(
                'http://localhost:8081/api/danisman/advisor-info',
                { email: user.email } 
            );
            
            setAdvisorInfo(response.data);
            
        } catch (error) {
            console.error("Danışman bilgileri çekilemedi:", error.response || error);
            setError("Danışman bilgileri yüklenirken bir hata oluştu.");
            setAdvisorInfo(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdvisorInfo();
    }, [user]); // user (yatırımcı) değiştiğinde tekrar çalışır

    // ⭐️ Görüntülenecek veriyi hazırlama (yükleniyor/hata durumunda varsayılan değer)
    const displayAdvisor = advisorInfo || { 
        ad: "Atanmamış",
        soyad: "Danışman",
        profilePhoto: "https://i.pravatar.cc/100?u=anon", // Varsayılan avatar
        email: "Destek için bilgi@quantshine.com",
        aciklama: "Size henüz bir danışman atanmamıştır veya sistemde bulunmamaktadır."
    };

    // ⭐️ Yükleme durumunu kontrol etme
    if (loading) return (
        <div className={`danisman-wrapper ${isDark ? "dark" : ""}`}>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <main className="danisman-main loading-screen">Yükleniyor...</main>
        </div>
    );
    
    // Yükleme bittiğinde ve veri geldiğinde içeriği göster
  return (
    <div className={`danisman-wrapper ${isDark ? "dark" : ""}`}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <main
        className={`danisman-main ${
          isSidebarOpen ? "sidebar-open" : "sidebar-collapsed"
        }`}
      >
        <header className="danisman-header">
          <h1>Danışman Bilgileri</h1>
          <div className="header-right">
            <button className="theme-toggle" onClick={toggleTheme}>
              {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
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
          
            {error && <div className="error-box">🚨 {error}</div>}

          {/* Açıklama Kartı */}
          <div className="stat-card">
            <p className="card-title">Açıklama</p>
            <textarea 
                readOnly 
                value={displayAdvisor.aciklama || "Danışmanın bir açıklaması bulunmamaktadır."}
            />
          </div>

          {/* Danışman Bilgileri Kartı */}
          <div className="stat-card">
            <p className="card-title">Danışman Bilgileri</p>
            <div className="card-content">
              <div className="advisor-profile">
                <img
                  src={displayAdvisor.profilePhoto || "https://i.pravatar.cc/100?u=anon"}
                  alt="Danışman"
                  className="advisor-avatar"
                />
                <div className="advisor-details">
                  <p>
                    <strong>İsim Soyisim:</strong> {displayAdvisor.ad} {displayAdvisor.soyad}
                  </p>
                  <p>
                    <strong>Email:</strong> {displayAdvisor.email}
                  </p>
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
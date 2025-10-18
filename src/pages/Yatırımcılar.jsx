import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Yatırımcılar.css";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AdminSidebar from "../components/AdminSidebar";
import { MdLightMode, MdDarkMode } from "react-icons/md";

const Yatırımcılar = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();
  const [yatirimcilar, setYatirimcilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aktifYatirimci, setAktifYatirimci] = useState(null);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const fetchYatirimcilar = async () => {
    if (!user || !user.email) {
      setLoading(false);
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:8081/api/danisman/my-clients",
        { email: user.email }
      );
      setYatirimcilar(response.data);
    } catch (error) {
      console.error("Yatırımcılar alınamadı:", error);
      setYatirimcilar([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYatirimcilar();
  }, [user]);

  return (
    <div className={`admin-wrapper ${isDark ? "dark" : ""}`}>
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

<main className={`admin-main ${isSidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}>
  {/* === ÜST BAR === */}
  <div className="admin-header">
    <h1 className="page-title">Yatırımcılar</h1>
    <div className="header-right">
      <button className="theme-toggle" onClick={toggleTheme}>
        {isDark ? "🌞 Light Mode" : "🌙 Dark Mode"}
      </button>
      <div className="user-info">
        <img
          src={user?.avatar || "/default-avatar.png"} // Diğer sayfalarla aynı fallback
          alt="avatar"
          className="avatar"
        />
        <span className="username">{user?.ad || user?.name || "Kullanıcı"}</span>
      </div>
    </div>
  </div>


        {/* İÇERİK */}
        <div className="admin-content">
          {loading && <p>Müşteri listesi yükleniyor...</p>}
          {!loading && yatirimcilar.length === 0 && (
            <p>Bu danışmana atanmış yatırımcı bulunmamaktadır.</p>
          )}

          {!loading && yatirimcilar.length > 0 && (
            <table className="yatirimci-table">
              <thead>
                <tr>
                  <th>Ad Soyad</th>
                  <th>Toplam Yatırım (₺)</th>
                  <th>Lot</th>
                  <th>Şu An Değeri (₺)</th>
                  <th>Kâr / Zarar (%)</th>
                </tr>
              </thead>
              <tbody>
                {yatirimcilar.map((y) => {
                  const toplamYatirim = y.toplamYatirim || 0;
                  const suanDeger = y.suanDeger || 0;
                  const lot = y.lot || 0;
                  const karZarar =
                    toplamYatirim > 0
                      ? (((suanDeger - toplamYatirim) / toplamYatirim) * 100).toFixed(2)
                      : "0.00";

                  return (
                    <tr
                      key={y.id}
                      className={aktifYatirimci?.id === y.id ? "selected-row" : ""}
                      onClick={() => setAktifYatirimci(y)}
                    >
                      <td>{y.ad} {y.soyad}</td>
                      <td>{toplamYatirim.toLocaleString()}</td>
                      <td>{lot}</td>
                      <td>{suanDeger.toLocaleString()}</td>
                      <td className={karZarar >= 0 ? "profit" : "loss"}>
                        {karZarar}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default Yatırımcılar;

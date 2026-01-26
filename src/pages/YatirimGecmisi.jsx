import React, { useState, useEffect } from "react"; // ✅ useEffect eklendi
import axios from "axios"; // ✅ axios eklendi
import "./YatirimGecmisi.css";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const YatirimGecmisi = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // 🚀 Backend'den gelecek veriler için state
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);

        // 🚀 DÜZELTME: "user" yerine login modalında kaydettiğin "userEmail" anahtarını kullanıyoruz
        const storedEmail = localStorage.getItem("userEmail");
        let activeEmail = user?.email || storedEmail;

        console.log("Sorgulanacak Email:", activeEmail);

        if (!activeEmail) {
          console.warn("Email bulunamadı, bekleniyor...");
          return;
        }

        const response = await axios.get(`http://localhost:8081/api/portfolio/transaction-history/${activeEmail}`);
        console.log("Veri başarıyla geldi:", response.data);
        setHistory(response.data);

      } catch (err) {
        console.error("Yatırım geçmişi çekilirken hata:", err.response || err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  return (
    <div className={`dashboard-wrapper ${isDark ? "dark" : ""}`}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className={`dashboard-main ${isSidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}>
        <header className="dashboard-header">
          <h1 className="dashboard-title">Yatırım Geçmişim</h1>

          <div className="header-right">
            <button className="theme-toggle" onClick={toggleTheme}>
              {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
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

          {loading ? (
            <div className="loading-state">Veriler yükleniyor...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>İşlem Tutarı (TL)</th>
                  <th>Alınan/Satılan Lot</th>
                  <th>O Tarihteki Fon Değeri</th>
                  <th>Şuanki Fon Değeri</th>
                  <th>İşlem Tipi</th>
                </tr>
              </thead>
              <tbody>
                {history.map((inv) => (
                  <tr key={inv.id}>
                    <td>{new Date(inv.transactionDate).toLocaleDateString('tr-TR')}</td>
                    <td style={{
                      fontWeight: 'bold',
                      color: inv.transactionType === 'DEPOSIT' ? '#10b981' : '#ef4444'
                    }}>
                      {inv.transactionType === 'DEPOSIT' ? '+' : '-'}{inv.amount.toLocaleString()} ₺
                    </td>
                    <td>{inv.lotAmount.toFixed(4)}</td>
                    <td>{inv.historicalFundPrice.toLocaleString()} ₺</td>
                    <td style={{ color: '#6366f1', fontWeight: 'bold' }}>
                      {inv.currentFundPrice.toLocaleString()} ₺
                    </td>
                    <td>
                      <span className={`type-badge ${inv.transactionType.toLowerCase()}`}>
                        {inv.transactionType === 'DEPOSIT' ? 'Yatırma' : 'Çekme'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
};

export default YatirimGecmisi;
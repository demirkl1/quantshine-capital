import React, { useState, useEffect } from "react";
import axios from "axios";
import "./YatırımcıEkleÇıkar.css";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AdminSidebar from "../components/AdminSidebar";

const YatırımcıEkleÇıkar = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();

const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const [istekler, setIstekler] = useState([]);
  const [loading, setLoading] = useState(true);

  // Backend’den bekleyen kullanıcıları çek
  const fetchPendingUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/admin/pending-users");
      setIstekler(response.data);
    } catch (err) {
      console.error("Bekleyen kullanıcılar yüklenemedi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []); 
  useEffect(() => {
    console.log("CONTEXT MAIL KONTROLÜ (YatırımcıEkleÇıkar):", user?.email);
}, [user]);

const handleKabulEt = async (id) => {
    // ⭐️ Adım 1: useAuth hook'undan danışmanın e-posta adresini al
    // (user objesinin { email: "..." } yapısında olduğunu varsayıyoruz)
    const danismanEmail = user?.email; // Opsiyonel zincirleme ile güvenli erişim
    console.log("KABUL ET BASILDIĞINDA MAİL:", danismanEmail);
    if (!danismanEmail) {
        alert("Hata: Onaylayan danışmanın e-posta bilgisi bulunamadı. Lütfen tekrar giriş yapın.");
        return;
    }

    try {
        // ⭐️ Adım 2: API isteği gövdesine e-posta adresini ekle
        const payload = { 
            danismanEmail: danismanEmail 
        };
        
      await axios.post(
            `http://localhost:8081/api/admin/approve-user/${id}`, 
            payload // ⭐️ Payload'ı istek gövdesi olarak gönder
        );
        
      setIstekler(istekler.filter((i) => i.id !== id));
      alert("Yatırımcı onaylandı ve kullanıcı tablosuna eklendi.");
      
    } catch (err) {
      console.error("Kabul işlemi başarısız:", err);
      alert("Kabul işlemi başarısız: " + (err.response?.data?.message || "Sunucu hatası."));
    }
  };

  const handleReddet = async (id) => {
    try {
      await axios.post(`http://localhost:8081/api/admin/reject-user/${id}`);
      setIstekler(istekler.filter((i) => i.id !== id));
      alert("Yatırımcı reddedildi.");
    } catch (err) {
      console.error("Reddetme işlemi başarısız:", err);
      alert("Reddetme işlemi başarısız.");
    }
  };

  return (
    <div className={`admin-wrapper ${isDark ? "dark" : ""}`}>
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <main className={`admin-main ${isSidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}>
        <header className="admin-header">
          <div className="header-right">
            <button className="theme-toggle" onClick={toggleTheme}>
              {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
            <div className="user-profile">
              <img src="https://i.pravatar.cc/40" alt="Admin Avatar" className="avatar" />
              <span>{user ? `${user.name} ${user.surname}` : "Admin"}</span>
            </div>
          </div>
        </header>

        <div className="admin-content">
          <h1>Yatırımcı Ekle / Çıkar</h1>

          {loading ? (
            <p>Yükleniyor...</p>
          ) : istekler.length === 0 ? (
            <p className="no-requests">Şu anda bekleyen kayıt isteği bulunmamaktadır.</p>
          ) : (
            <table className="istek-table">
              <thead>
                <tr>
                  <th>Ad Soyad</th>
                  <th>Email</th>
                  <th>Doğum Tarihi</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {istekler.map((i) => (
                  <tr key={i.id}>
                    <td>{i.ad} {i.soyad}</td>
                    <td>{i.email}</td>
                    <td>{i.dogumTarihi}</td>
                    <td className="buttons">
                      <button className="accept-btn" onClick={() => handleKabulEt(i.id)}>Kabul Et</button>
                      <button className="reject-btn" onClick={() => handleReddet(i.id)}>Reddet</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default YatırımcıEkleÇıkar;

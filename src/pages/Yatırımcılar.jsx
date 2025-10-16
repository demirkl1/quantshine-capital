import React, { useState } from "react";
import "./Yatırımcılar.css";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AdminSidebar from "../components/AdminSidebar";

const Yatırımcılar = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();

  const [yatirimcilar, setYatirimcilar] = useState([
    {
      id: 1,
      ad: "Ahmet",
      soyad: "Yılmaz",
      email: "ahmet@example.com",
      tc: "12345678901",
      tel: "0555 111 2233",
      toplamYatirim: 4000,
      lot: 400,
      suanDeger: 4200,
    },
    {
      id: 2,
      ad: "Ayşe",
      soyad: "Demir",
      email: "ayse@example.com",
      tc: "10987654321",
      tel: "0555 987 6543",
      toplamYatirim: 5000,
      lot: 500,
      suanDeger: 4700,
    },
  ]);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const [aktifYatirimci, setAktifYatirimci] = useState(null);

  // Ekle/çıkar formu
  const [islem, setIslem] = useState("ekle");
  const [fiyat, setFiyat] = useState("");
  const [lot, setLot] = useState("");
  const birimFiyat = 10; // örnek

  const handleFiyatChange = (e) => {
    const value = e.target.value;
    setFiyat(value);
    if (value) setLot((value / birimFiyat).toFixed(2));
    else setLot("");
  };

  const handleLotChange = (e) => {
    const value = e.target.value;
    setLot(value);
    if (value) setFiyat((value * birimFiyat).toFixed(2));
    else setFiyat("");
  };

  const handleYatirimIslemi = () => {
    if (!aktifYatirimci) return alert("Lütfen bir yatırımcı seçiniz!");

    const updated = yatirimcilar.map((y) => {
      if (y.id === aktifYatirimci.id) {
        const miktar = parseFloat(fiyat) || 0;
        const lotSayisi = parseFloat(lot) || 0;
        if (islem === "ekle") {
          return {
            ...y,
            toplamYatirim: y.toplamYatirim + miktar,
            lot: y.lot + lotSayisi,
            suanDeger: y.suanDeger + miktar, // örnek basit mantık
          };
        } else {
          return {
            ...y,
            toplamYatirim: y.toplamYatirim - miktar,
            lot: y.lot - lotSayisi,
            suanDeger: y.suanDeger - miktar,
          };
        }
      }
      return y;
    });
    setYatirimcilar(updated);
    setFiyat("");
    setLot("");
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
          <h1>Yatırımcılar</h1>

          {/* Yatırımcı Tablosu */}
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
                const karZarar = (((y.suanDeger - y.toplamYatirim) / y.toplamYatirim) * 100).toFixed(2);
                return (
                  <tr
                    key={y.id}
                    className={aktifYatirimci?.id === y.id ? "selected-row" : ""}
                    onClick={() => setAktifYatirimci(y)}
                  >
                    <td>{y.ad} {y.soyad}</td>
                    <td>{y.toplamYatirim.toLocaleString()}</td>
                    <td>{y.lot}</td>
                    <td>{y.suanDeger.toLocaleString()}</td>
                    <td className={karZarar >= 0 ? "profit" : "loss"}>{karZarar}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Seçilen yatırımcı detay ve işlem alanı */}
          {aktifYatirimci && (
            <div className="yatirimci-detay">
              <h3>{aktifYatirimci.ad} {aktifYatirimci.soyad}</h3>
              <p><strong>Email:</strong> {aktifYatirimci.email}</p>
              <p><strong>TC:</strong> {aktifYatirimci.tc}</p>
              <p><strong>Tel:</strong> {aktifYatirimci.tel}</p>

              <div className="yatirim-form">
                <h2>Yatırım İşlemi</h2>
                <div className="islem-sec">
                  <label>
                    <input
                      type="radio"
                      name="islem"
                      value="ekle"
                      checked={islem === "ekle"}
                      onChange={() => setIslem("ekle")}
                    />
                    Ekle
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="islem"
                      value="cikar"
                      checked={islem === "cikar"}
                      onChange={() => setIslem("cikar")}
                    />
                    Çıkar
                  </label>
                </div>

                <div className="form-row">
                  <label>Fiyat (₺)</label>
                  <input type="number" value={fiyat} onChange={handleFiyatChange} />
                </div>
                <div className="form-row">
                  <label>Lot</label>
                  <input type="number" value={lot} onChange={handleLotChange} />
                </div>

                <button className="submit-btn" onClick={handleYatirimIslemi}>
                  {islem === "ekle" ? "Yatırım Ekle" : "Yatırım Çıkar"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Yatırımcılar;

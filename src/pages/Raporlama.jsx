import React, { useState } from "react";
import "./Raporlama.css";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AdminSidebar from "../components/AdminSidebar";

const Raporlama = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();

  const [selectedInvestor, setSelectedInvestor] = useState(null);
  const [reportText, setReportText] = useState("");

  // Örnek yatırımcı verileri (backend’den çekilecek)
  const investors = [
    {
      id: 1,
      name: "Ahmet Yılmaz",
      email: "ahmet@example.com",
      totalInvestment: 50000,
      profitLoss: "+8%",
    },
    {
      id: 2,
      name: "Elif Demir",
      email: "elif@example.com",
      totalInvestment: 32000,
      profitLoss: "-3%",
    },
  ];

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const handleSendReport = () => {
    if (!selectedInvestor || !reportText.trim()) {
      alert("Lütfen yatırımcı seçip rapor giriniz.");
      return;
    }

    console.log("Rapor gönderildi:", {
      to: selectedInvestor.name,
      report: reportText,
    });

    // Backend entegrasyonu burada yapılacak:
    /*
    axios.post("/api/reports", {
      advisorId: user.id,
      investorId: selectedInvestor.id,
      text: reportText,
    })
    */

    alert(`${selectedInvestor.name} için rapor gönderildi.`);
    setReportText("");
  };

  return (
    <div className={`admin-wrapper ${isDark ? "dark" : ""}`}>
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <main
        className={`admin-main ${
          isSidebarOpen ? "sidebar-open" : "sidebar-collapsed"
        }`}
      >
        <header className="admin-header">
          <div className="header-right">
            <button className="theme-toggle" onClick={toggleTheme}>
              {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
            <div className="user-profile">
              <img
                src="https://i.pravatar.cc/40"
                alt="Admin Avatar"
                className="avatar"
              />
              <span>{user ? `${user.name} ${user.surname}` : "Admin"}</span>
            </div>
          </div>
        </header>

        <div className="admin-content raporlama-container">
          <h1>Raporlama</h1>

          {/* Yatırımcı Seçimi */}
          <div className="investor-select">
            <label>Yatırımcı Seç:</label>
            <select
              onChange={(e) => {
                const investor = investors.find(
                  (inv) => inv.id === parseInt(e.target.value)
                );
                setSelectedInvestor(investor);
              }}
              defaultValue=""
            >
              <option value="" disabled>
                Seçiniz...
              </option>
              {investors.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.name}
                </option>
              ))}
            </select>
          </div>

          {/* Yatırımcı Bilgileri */}
          {selectedInvestor && (
            <div className="investor-info">
              <p>
                <strong>Ad Soyad:</strong> {selectedInvestor.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedInvestor.email}
              </p>
              <p>
                <strong>Toplam Yatırım:</strong>{" "}
                {selectedInvestor.totalInvestment.toLocaleString()} ₺
              </p>
              <p>
                <strong>Kâr/Zarar:</strong> {selectedInvestor.profitLoss}
              </p>
            </div>
          )}

          {/* Rapor Yazma Alanı */}
          <div className="report-section">
            <label>Haftalık Rapor:</label>
            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Bu hafta yatırımcının portföy performansı hakkında raporunuzu yazınız..."
              rows={6}
            />
          </div>

          <button className="send-report-btn" onClick={handleSendReport}>
            📤 Raporu Gönder
          </button>
        </div>
      </main>
    </div>
  );
};

export default Raporlama;

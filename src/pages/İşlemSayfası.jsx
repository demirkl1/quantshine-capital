import React, { useState, useEffect } from "react";
import axios from "axios"; // Backend iletişimi için
import "./İşlemSayfası.css";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AdminSidebar from "../components/AdminSidebar";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

const İşlemSayfası = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth(); // Danışmanın e-postasını çekmek için

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  // ⭐️ DİNAMİK STATE'LER ⭐️
  const [investors, setInvestors] = useState([]); // Atanmış yatırımcı listesi
  const [loading, setLoading] = useState(true);
  const [selectedInvestor, setSelectedInvestor] = useState(null); // Seçili yatırımcı objesi

  // Sabit hisse senetleri (Bunu da Backend'den çekmeniz önerilir)
  const [stocks] = useState([
    { name: "THYAO", price: 280, change: "+1.2%" },
    { name: "ASELS", price: 52.4, change: "-0.8%" },
    { name: "KCHOL", price: 190.5, change: "+0.3%" },
    { name: "GARAN", price: 63.7, change: "-0.1%" },
  ]);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "buy" | "sell"
  const [selectedStock, setSelectedStock] = useState(null);
  const [quantity, setQuantity] = useState(0);

  const filteredStocks = stocks.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

    // ⭐️ YENİ: Backend'den, sadece bu danışmana ait olan yatırımcıları çeken fonksiyon
    const fetchInvestors = async () => {
        if (!user || !user.email) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // POST isteği ile danışmanın e-postasını Backend'e gönderiyoruz
            const response = await axios.post(
                'http://localhost:8081/api/danisman/my-clients',
                { email: user.email } 
            );
            
            const clientData = response.data;
            setInvestors(clientData);
            
            // Veri varsa, ilk müşteriyi seçili hale getir
            if (clientData.length > 0) {
                 setSelectedInvestor(clientData[0]);
            } else {
                setSelectedInvestor(null);
            }
            
        } catch (error) {
            console.error("Müşteri listesi çekilemedi:", error.response || error);
            setInvestors([]);
        } finally {
            setLoading(false);
        }
    };

  useEffect(() => {
    fetchInvestors(); // Sayfa yüklendiğinde ve user değiştiğinde verileri çek
  }, [user]); 
    
  // Combobox'ta seçim değiştiğinde çağrılır
  const handleInvestorChange = (e) => {
    const investorId = parseInt(e.target.value);
    // Seçilen ID'ye göre listeden yatırımcıyı bulur ve selectedInvestor'a atar
    const selected = investors.find((inv) => inv.id === investorId) || null;
    setSelectedInvestor(selected);
  };


  const openModal = (stock, type) => {
    setSelectedStock(stock);
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setQuantity(0);
  };

  const confirmTrade = () => {
    if (!selectedInvestor) return alert("Lütfen bir yatırımcı seçiniz!");
    // ⭐️ NOT: Bu fonksiyonun Backend API'nizi çağırması gerekir.
    console.log(`${selectedInvestor.ad} ${selectedInvestor.soyad} için ${selectedStock.name} hissesine ${quantity} lot ${modalType}`);
    closeModal();
  };

  // Yatırımcı verilerinin null olma ihtimaline karşı varsayılan boş portföy
  const portfolioData = selectedInvestor?.portfolio || [
    { name: "Nakit", value: 1, color: "#AAAAAA" } 
  ];
  const historyData = selectedInvestor?.history || [];
  const balance = selectedInvestor?.balance || 0;


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
          <h1>İşlem Sayfası</h1>

          {/* Yatırımcı seçimi - Dinamik Listeye Bağlandı */}
          <div className="investor-select">
            <label>Yatırımcı Seç:</label>
            <select
              value={selectedInvestor ? selectedInvestor.id : ''}
              onChange={handleInvestorChange}
              disabled={loading || investors.length === 0}
            >
                {loading && <option value="">Yükleniyor...</option>}
                {!loading && investors.length === 0 && <option value="">Atanmış Yatırımcı Yok</option>}
                
                {/* ⭐️ Yatırımcı Listesi */}
                <option value="" disabled={investors.length > 0}>Yatırımcı Seçiniz</option>
                {investors.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.ad} {inv.soyad} ({inv.email}) {/* ⭐️ İstenen Format */}
                </option>
              ))}
            </select>
          </div>
          
          {/* Sadece yatırımcı seçili ise içeriği göster */}
          {selectedInvestor && (
            <>
            <div className="transaction-top">
              {/* Sol: Hisse tablosu */}
              <div className="stock-table-container">
                <input
                  type="text"
                  placeholder="Hisse adına göre ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-input"
                />
                <table className="stock-table">
                  <thead>
                    <tr>
                      <th>Hisse Adı</th>
                      <th>Fiyat</th>
                      <th>Değişim</th>
                      <th>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStocks.map((s, i) => (
                      <tr key={i}>
                        <td>{s.name}</td>
                        <td>{s.price} ₺</td>
                        <td className={s.change.startsWith("+") ? "positive" : "negative"}>
                          {s.change}
                        </td>
                        <td>
                          <button className="buy-btn" onClick={() => openModal(s, "buy")}>
                            Al
                          </button>
                          <button className="sell-btn" onClick={() => openModal(s, "sell")}>
                            Sat
                          </button>
                        </td>
                      </tr>
                  ))}
                </tbody>
                </table>
              </div>

              {/* Sağ: Fon dağılımı */}
              <div className="fund-summary">
                <h3>Fon Bakiyesi</h3>
                <p className="balance">{balance.toLocaleString()} ₺</p>

                <h4>Fon Dağılımı</h4>
                <div className="chart-container">
                  <PieChart width={220} height={150}>
                    <Pie
                      data={portfolioData}
                      dataKey="value"
                      startAngle={180}
                      endAngle={0}
                      innerRadius={50}
                      outerRadius={80}
                      cx="50%"
                      cy="100%"
                    >
                      {portfolioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </div>

              <ul className="fund-details">
                {portfolioData.map((p, i) => (
                  <li key={i}>
                    <span className="color-dot" style={{ backgroundColor: p.color }}></span>
                    {p.name}: {p.value.toLocaleString()} ₺
                  </li>
                ))}
              </ul>
            </div>
          </div>
          </>
          )}

          {/* Alt: İşlem geçmişi */}
          <div className="history-section">
            <h3>İşlem Geçmişi</h3>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Hisse Adı</th>
                  <th>İşlem</th>
                  <th>Fiyat</th>
                  <th>Adet</th>
                </tr>
              </thead>
              <tbody>
                {historyData.map((h, i) => (
                  <tr key={i}>
                    <td>{h.date}</td>
                    <td>{h.stock}</td>
                    <td className={h.type === "Alış" ? "positive" : "negative"}>{h.type}</td>
                    <td>{h.price} ₺</td>
                    <td>{h.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>
              {selectedStock.name} - {modalType === "buy" ? "Alış" : "Satış"} İşlemi
            </h3>
            <p>Fiyat: {selectedStock.price} ₺</p>
            <label>
              Miktar (Lot):
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </label>
            <div className="modal-buttons">
              <button onClick={confirmTrade} className="confirm-btn">
                Onayla
              </button>
              <button onClick={closeModal} className="cancel-btn">
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default İşlemSayfası;
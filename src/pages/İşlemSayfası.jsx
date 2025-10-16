import React, { useState } from "react";
import "./İşlemSayfası.css";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AdminSidebar from "../components/AdminSidebar";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

const İşlemSayfası = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  // 🎯 Yatırımcı listesi
  const investors = [
    {
      id: 1,
      name: "Ahmet Yılmaz",
      balance: 50000,
      portfolio: [
        { name: "Nakit", value: 20000, color: "#4CAF50" },
        { name: "THYAO", value: 20000, color: "#2196F3" },
        { name: "ASELS", value: 10000, color: "#FFC107" },
      ],
      history: [
        { date: "14.10.2025", stock: "THYAO", type: "Alış", price: 270, quantity: 50 },
        { date: "12.10.2025", stock: "ASELS", type: "Satış", price: 53, quantity: 20 },
      ],
    },
    {
      id: 2,
      name: "Mehmet Kaya",
      balance: 80000,
      portfolio: [
        { name: "Nakit", value: 30000, color: "#4CAF50" },
        { name: "KCHOL", value: 30000, color: "#2196F3" },
        { name: "GARAN", value: 20000, color: "#FFC107" },
      ],
      history: [
        { date: "10.10.2025", stock: "KCHOL", type: "Alış", price: 180, quantity: 60 },
      ],
    },
  ];

  const [selectedInvestor, setSelectedInvestor] = useState(investors[0]);
  const [search, setSearch] = useState("");

  const [stocks] = useState([
    { name: "THYAO", price: 280, change: "+1.2%" },
    { name: "ASELS", price: 52.4, change: "-0.8%" },
    { name: "KCHOL", price: 190.5, change: "+0.3%" },
    { name: "GARAN", price: 63.7, change: "-0.1%" },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "buy" | "sell"
  const [selectedStock, setSelectedStock] = useState(null);
  const [quantity, setQuantity] = useState(0);

  const filteredStocks = stocks.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

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
    // Şimdilik sadece konsola yaz
    console.log(`${selectedInvestor.name} ${selectedStock.name} için ${quantity} lot ${modalType}`);
    closeModal();
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
          <h1>İşlem Sayfası</h1>

          {/* Yatırımcı seçimi */}
          <div className="investor-select">
            <label>Yatırımcı Seç:</label>
            <select
              value={selectedInvestor.id}
              onChange={(e) =>
                setSelectedInvestor(investors.find((inv) => inv.id === parseInt(e.target.value)))
              }
            >
              {investors.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.name}
                </option>
              ))}
            </select>
          </div>

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
              <p className="balance">{selectedInvestor.balance.toLocaleString()} ₺</p>

              <h4>Fon Dağılımı</h4>
              <div className="chart-container">
                <PieChart width={220} height={150}>
                  <Pie
                    data={selectedInvestor.portfolio}
                    dataKey="value"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={50}
                    outerRadius={80}
                    cx="50%"
                    cy="100%"
                  >
                    {selectedInvestor.portfolio.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </div>

              <ul className="fund-details">
                {selectedInvestor.portfolio.map((p, i) => (
                  <li key={i}>
                    <span className="color-dot" style={{ backgroundColor: p.color }}></span>
                    {p.name}: {p.value.toLocaleString()} ₺
                  </li>
                ))}
              </ul>
            </div>
          </div>

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
                {selectedInvestor.history.map((h, i) => (
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

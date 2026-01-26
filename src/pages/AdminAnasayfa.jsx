import React, { useState, useEffect, useMemo } from "react"; // useMemo eklendi
import axios from "axios";
import "./AdminAnasayfa.css";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AdminSidebar from "../components/AdminSidebar";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const AdminAnasayfa = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();

  const [allUsers, setAllUsers] = useState([]);
  const [fundHistory, setFundHistory] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [newPrice, setNewPrice] = useState("");
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const [historyLog, setHistoryLog] = useState([]); // Yeni State

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [usersRes, priceRes, historyRes, logRes] = await Promise.all([
        axios.get("http://localhost:8081/api/admin/all-investors"),
        axios.get("http://localhost:8081/api/admin/fund-price"),
        axios.get("http://localhost:8081/api/admin/fund-history"),
        axios.get("http://localhost:8081/api/admin/history-all") // 🚀 Yeni eklediğin endpoint
      ]);

      setAllUsers(usersRes.data);
      setCurrentPrice(priceRes.data.price || 1.0);
      setFundHistory(historyRes.data);
      setHistoryLog(logRes.data); // 👈 Gelen veriyi buraya yazıyoruz
    } catch (err) {
      console.error("Veri çekme hatası:", err);
    } finally {
      setLoading(false);
    }
  };
  const [timeRange, setTimeRange] = useState("ALL"); // Varsayılan tümü

  const filteredHistory = useMemo(() => {
    if (!fundHistory.length) return [];

    const now = new Date();
    let startDate = new Date();

    if (timeRange === "1W") startDate.setDate(now.getDate() - 7);
    else if (timeRange === "1M") startDate.setMonth(now.getMonth() - 1);
    else if (timeRange === "1Y") startDate.setFullYear(now.getFullYear() - 1);
    else if (timeRange === "3Y") startDate.setFullYear(now.getFullYear() - 3);
    else return fundHistory; // ALL durumu

    return fundHistory.filter(h => new Date(h.recordedAt) >= startDate);
  }, [fundHistory, timeRange]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // --- 🧮 HESAPLAMA MOTORU (SENİN FORMÜLLERİN) ---
  const stats = useMemo(() => {
    const myAdminEmail = user?.email?.toLowerCase().trim();

    // 1. Senin Yatırımcılarını Filtrele
    const myInvestors = allUsers.filter(u => u.danismanEmail?.toLowerCase().trim() === myAdminEmail);

    // 2. Senin Yönettiğin Kısım (YÖNETİLEN FON TOPLAM DEĞERİ)
    const mTotal = myInvestors.reduce((acc, inv) => acc + (Number(inv.suanDeger) || 0), 0);
    const mPrincipal = myInvestors.reduce((acc, inv) => acc + (Number(inv.toplamYatirim) || 0), 0);

    // Fon Kâr/Zarar: (Son Durum / Anapara) * 100
    const mPL = mPrincipal > 0 ? (mTotal / mPrincipal) * 100 : 0;

    // 3. Şirket Geneli (ŞİRKET FON BÜYÜKLÜĞÜ)
    const cTotal = allUsers.reduce((acc, inv) => acc + (Number(inv.suanDeger) || 0), 0);
    const cPrincipal = allUsers.reduce((acc, inv) => acc + (Number(inv.toplamYatirim) || 0), 0);
    const cPL = cPrincipal > 0 ? (cTotal / cPrincipal) * 100 : 0;

    return { managedTotal: mTotal, managedPL: mPL, companyTotal: cTotal, companyPL: cPL, myInvestors };
  }, [allUsers, user?.email]);
  const handleUpdatePrice = async () => {
    if (!newPrice || newPrice <= 0) return alert("Geçerli bir fiyat gir kanka!");
    try {
      await axios.put(`http://localhost:8081/api/admin/update-fund-price?newPrice=${newPrice}`);
      alert(`✅ Fiyat ${newPrice} ₺ olarak güncellendi!`);
      setNewPrice("");
      fetchDashboardData();
    } catch (err) {
      alert("Güncelleme başarısız!");
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { left: 10, right: 25, top: 20, bottom: 10 } }, // Kenarlardan boşluk
    plugins: {
      legend: { display: false },
      tooltip: { intersect: false, mode: 'index' }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 6, // 🚀 Sıkışıklığı önleyen en kritik ayar: Sadece 6 tarih göster
          maxRotation: 0,
          color: isDark ? '#94a3b8' : '#64748b',
          font: { size: 11 }
        }
      },
      y: {
        position: 'right', // 📈 Borsalardaki gibi fiyatı sağa alalım, alan açılır
        grid: { color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          callback: (value) => value.toLocaleString() + ' ₺'
        }
      }
    }
  };

  const chartDataValues = {
    labels: filteredHistory.map(h => {
      const d = new Date(h.recordedAt);
      // 1 haftalıksa saati göster, değilse sadece günü göster (Ferahlık sağlar)
      return timeRange === "1W"
        ? d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
        : d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: '2-digit' });
    }),
    datasets: [{
      label: "Birim Fiyat",
      data: filteredHistory.map(h => h.price),
      borderColor: "#10b981",
      backgroundColor: "rgba(16, 185, 129, 0.1)",
      fill: true,
      tension: 0.3,
      pointRadius: filteredHistory.length > 50 ? 0 : 4, // 🚀 Çok veri varsa noktaları gizle, çizgi kalsın
      borderWidth: 2,
    }]
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
              <span>{user ? `${user.name} ${user.surname}` : "Admin"}</span>
            </div>
          </div>
        </header>

        <div className="admin-content">
          <div className="stats-cards">
            <div className="card">
              <h4>Yönetilen Fon Toplam Değeri</h4>
              {/* stats?.managedTotal şeklinde ? koyuyoruz ve undefined ise 0 yaz diyoruz */}
              <p>{(stats?.managedTotal || 0).toLocaleString('tr-TR')} ₺</p>
            </div>

            <div className="card">
              <h4>Şirket Fon Büyüklüğü</h4>
              <p>{(stats?.companyTotal || 0).toLocaleString('tr-TR')} ₺</p>
            </div>

            <div className="card">
              <h4>Fon Kâr/Zarar (%)</h4>
              {/* toFixed öncesinde de değerin varlığını kontrol ediyoruz */}
              <p className={(stats?.managedPL || 0) >= 100 ? "text-green" : "text-red"}>
                %{(stats?.managedPL || 0).toFixed(2)}
              </p>
            </div>

            <div className="card">
              <h4>Şirket Kâr/Zarar (%)</h4>
              <p className={(stats?.companyPL || 0) >= 100 ? "text-green" : "text-red"}>
                %{(stats?.companyPL || 0).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="update-price-panel" style={{ backgroundColor: isDark ? '#1e293b' : 'white' }}>
            <div>
              <h3>⚡ Fon Birim Fiyatını Güncelle</h3>
              <p>Mevcut Fiyat: <strong>{currentPrice} ₺</strong></p>
            </div>
            <div className="input-row">
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="Yeni Fiyat..."
              />
              <button onClick={handleUpdatePrice}>GÜNCELLE 🚀</button>
            </div>
          </div>
          <div className="chart-container-wrapper">
            <div className="chart-header">
              <h3>📈 Fon Performansı</h3>
              <div className="time-filters">
                {["1W", "1M", "1Y", "3Y", "ALL"].map((range) => (
                  <button
                    key={range}
                    className={timeRange === range ? "active" : ""}
                    onClick={() => setTimeRange(range)}
                  >
                    {range === "ALL" ? "Tümü" : range}
                  </button>
                ))}
              </div>
            </div>

            <div className="chart-container" style={{ height: '400px' }}>
              <Line data={chartDataValues} options={chartOptions} />
            </div>
          </div>

          <div className="table-card">
            <h3>Şirket Genel İşlem Geçmişi</h3>
            <div className="scrollable-table">
              <table>
                <thead>
                  <tr>
                    <th>TARİH</th>
                    <th>MÜŞTERİ</th>
                    <th>İŞLEM</th>
                    <th>MİKTAR</th>
                  </tr>
                </thead>
                <tbody>
                  {historyLog.length > 0 ? (
                    historyLog.map((log, i) => (
                      <tr key={i}>
                        <td>{new Date(log.transactionDate).toLocaleDateString('tr-TR')}</td>
                        <td className="font-bold">{log.email}</td>
                        <td>
                          <span className={log.transactionType === 'DEPOSIT' ? "text-green" : "text-red"}>
                            {log.transactionType === 'DEPOSIT' ? 'YATIRMA' : 'ÇEKME'}
                          </span>
                        </td>
                        <td className="font-bold">{(log.amount || 0).toLocaleString()} ₺</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4" style={{ textAlign: 'center' }}>İşlem kaydı bulunamadı.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminAnasayfa;
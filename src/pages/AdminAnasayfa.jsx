import React from "react";
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
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AdminAnasayfa = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);
  const { user } = useAuth();

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  // Dummy veri
  const fundData = {
    labels: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran"],
    datasets: [
      {
        label: "Fon Değeri",
        data: [100, 120, 115, 130, 125, 140],
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        tension: 0.4,
      },
    ],
  };

  const customersData = [
    { 
      ad: "Ahmet Y.", 
      toplamYatirim: "₺500.000", 
      lot: 50, 
      kzarar: "+10%", 
      detay: "Adres: İstanbul\nEmail: ahmet@example.com\nTelefon: 0555 123 45 67" 
    },
    { 
      ad: "Ayşe K.", 
      toplamYatirim: "₺300.000", 
      lot: 30, 
      kzarar: "+5%", 
      detay: "Adres: Ankara\nEmail: ayse@example.com\nTelefon: 0555 987 65 43"
    },
    { 
      ad: "Mehmet T.", 
      toplamYatirim: "₺200.000", 
      lot: 20, 
      kzarar: "-2%", 
      detay: "Adres: İzmir\nEmail: mehmet@example.com\nTelefon: 0555 555 55 55"
    },
  ];

  const cashFlowData = [
    { tarih: "01.10.2025", tip: "Giriş", miktar: "₺200.000", lot: 20 },
    { tarih: "05.10.2025", tip: "Çıkış", miktar: "₺50.000", lot: 5 },
    { tarih: "10.10.2025", tip: "Giriş", miktar: "₺100.000", lot: 10 },
  ];

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
          {/* Üst istatistik kartları */}
          <div className="stats-cards">
            <div className="card">
              <h4>Yönettiğin Fon Toplamı</h4>
              <p>₺1.000.000</p>
            </div>
            <div className="card">
              <h4>Şirketteki Fon Büyüklüğü</h4>
              <p>₺10.000.000</p>
            </div>
            <div className="card">
              <h4>Fon Kar/Zarar (%)</h4>
              <p>+8%</p>
            </div>
            <div className="card">
              <h4>Şirket Fon Kar/Zarar (%)</h4>
              <p>+12%</p>
            </div>
          </div>

          {/* Grafik */}
          <div className="chart-container">
            <Line data={fundData} />
          </div>

          {/* Alt tablolar */}
          <div className="tables-container">
            {/* Fonda Bulunan Müşteriler */}
            <div className="table-card">
              <h3>Fonda Bulunan Müşteriler</h3>
              <table className="customer-table">
                <thead>
                  <tr>
                    <th>AD</th>
                    <th>TOPLAM YATIRIM</th>
                    <th>FONDAKİ LOT MİKTARI</th>
                    <th>K/Z(%)</th>
                  </tr>
                </thead>
                <tbody>
                  {customersData.map((c, i) => (
                    <tr key={i} className="customer-row" title={c.detay.replace(/\n/g, ' • ')}>
                      <td>{c.ad}</td>
                      <td>{c.toplamYatirim}</td>
                      <td>{c.lot}</td>
                      <td>{c.kzarar}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Fona Giren/Çıkan Para Miktarı */}
            <div className="table-card">
              <h3>Fona Giren/Çıkan Para Miktarı</h3>
              <table className="cashflow-table">
                <thead>
                  <tr>
                    <th>Tarih</th>
                    <th>Tip</th>
                    <th>Miktar</th>
                    <th>Lot Miktarı</th>
                  </tr>
                </thead>
                <tbody>
                  {cashFlowData.map((c, i) => (
                    <tr key={i}>
                      <td>{c.tarih}</td>
                      <td>{c.tip}</td>
                      <td>{c.miktar}</td>
                      <td>{c.lot}</td>
                    </tr>
                  ))}
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

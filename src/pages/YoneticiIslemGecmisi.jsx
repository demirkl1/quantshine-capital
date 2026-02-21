import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import { MdSearch } from 'react-icons/md';
import './YoneticiIslemGecmisi.css';

const YoneticiIslemGecmisi = () => {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllHistory = async () => {
      try {
        const res = await api.get('/trade/all-history');
        setHistory(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      } catch (err) {
        console.error("İşlem geçmişi yüklenemedi:", err);
        setLoading(false);
      }
    };
    if (token) fetchAllHistory();
  }, [token]);

  const filteredHistory = history.filter(item =>
    (item.investorTc && item.investorTc.includes(searchTerm)) || 
    (item.investorName && item.investorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.fundCode && item.fundCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="loading">Veriler Yükleniyor...</div>;

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <main className="admin-main">
        <header className="page-header">
          <h1>İşlem Geçmişi</h1>
          <p>Sistem üzerinden gerçekleştirilen tüm alım ve satım işlemlerinin kaydı.</p>
        </header>

        <div className="admin-content">
          <div className="search-container">
            <div className="search-box">
              <MdSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="TC, İsim veya Fon Kodu ile Ara..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>TC Kimlik No</th>
                  <th>Ad Soyad</th>
                  <th>Fon</th>
                  <th>İşlem Tipi</th>
                  <th>Tutar (TL)</th>
                  <th>Lot</th>
                  <th>Birim Fiyat (İşlem / Güncel)</th>
                  <th>Zaman</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => {
                  const tcNo = item.investorTc || "-";
                  const name = item.investorName || "Bilinmiyor";
                  const lotCount = item.lot || 0;
                  const bPrice = item.boughtPrice || 0;
                  const cPrice = item.currentPrice || 0;

                  const profitRate = bPrice !== 0 
                    ? (((cPrice - bPrice) / bPrice) * 100).toFixed(2) 
                    : "0.00";
                  const isProfit = cPrice >= bPrice;

                  return (
                    <tr key={item.id}>
                      <td>{tcNo}</td>
                      <td>{name}</td>
                      <td>
                        <span className={`badge-fund ${item.fundCode}`}>
                          {item.fundCode}
                        </span>
                      </td>
                      <td>
                        <span className={`islem-badge ${item.type === 'BUY' ? 'alim' : 'satim'}`}>
                          {item.type === 'BUY' ? 'ALIM' : 'SATIM'}
                        </span>
                      </td>
                      <td className="font-bold">₺{item.amount?.toLocaleString('tr-TR')}</td>
                      <td>{lotCount}</td>
                      <td>
                        <div className="price-stack">
                          <span className="old-price">İşlem: ₺{bPrice.toFixed(2)}</span>
                          <span className="new-price">Güncel: ₺{cPrice.toFixed(2)}</span>
                        </div>
                      </td>
                    
                      <td className="date-cell">
                        {item.createdAt ? new Date(item.createdAt).toLocaleString('tr-TR') : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredHistory.length === 0 && (
              <div className="no-result">Aranan kritere ait işlem bulunamadı.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default YoneticiIslemGecmisi;
import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import InvestorSidebar from '../components/InvestorSidebar';
import './YatirimGecmisim.css';

const YatirimGecmisim = () => {
  const { token } = useAuth();
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchMyHistory = async () => {
      try {
        const res = await api.get('/trade/my-history');
        setHistoryData(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Geçmiş yüklenemedi:", err);
        setLoading(false);
      }
    };
    if (token) fetchMyHistory();
  }, [token]);

  if (loading) return <div className="loading">Yatırım geçmişiniz yükleniyor...</div>;

  return (
    <div className="admin-wrapper">
      <InvestorSidebar />
      <main className="admin-main">
        <header className="page-header">
          <h1>Yatırım Geçmişim</h1>
          <p>Gerçekleştirdiğiniz tüm fon alım ve satım işlemlerinin detaylı dökümü.</p>
        </header>

        <div className="admin-content">
          <div className="history-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Fon</th>
                  <th>İşlem</th>
                  <th>Lot</th>
                  <th>Tutar</th>
                  <th>O Anki Değer</th>
                  <th>Şu Anki Değer</th>
                </tr>
              </thead>
              <tbody>
                {historyData.map((item) => {
                  // Kâr/Zarar Renk Analizi (Örn: Şu anki değer 1.0 ise)
                  
                  const currentPrice = item.currentPrice || item.unitPrice;
                  const isProfit = currentPrice >= item.unitPrice;

                  return (
                    <tr key={item.id}>
                      <td className="date-cell">
                        {new Date(item.createdAt).toLocaleString('tr-TR')}
                      </td>
                      <td className="text-highlight">{item.fundCode}</td>
                      <td>
                        <span className={`status-badge ${item.type === 'BUY' ? 'buy' : 'sell'}`}>
                          {item.type === 'BUY' ? 'ALIŞ' : 'SATIŞ'}
                        </span>
                      </td>
                      <td>{item.lotCount}</td>
                      <td className="text-white font-bold">₺{item.amount.toLocaleString()}</td>
                      <td>₺{item.unitPrice}</td>
                      <td className={isProfit ? 'text-profit' : 'text-loss'} style={{ fontWeight: 'bold' }}>
        ₺{currentPrice.toFixed(2)}
        {currentPrice > item.unitPrice ? ' ↑' : currentPrice < item.unitPrice ? ' ↓' : ''}
      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {historyData.length === 0 && (
              <div className="no-result">Henüz bir işlem gerçekleştirilmedi.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default YatirimGecmisim;
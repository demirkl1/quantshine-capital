import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import AdvisorSidebar from '../components/AdvisorSidebar';
import './AdvisorYatirimcilarim.css';

const AdvisorYatirimcilar = () => {
  const { token } = useAuth();
  const [investors, setInvestors] = useState([]);
  const [portfolios, setPortfolios] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!token) return;
    try {
      const res = await api.get('/users/my-investors');
      
      // Investment listesinden investor bilgilerini ayıklıyoruz
      const processedInvestors = res.data
        .filter(item => item && item.investor)
        .map(item => item.investor);

      setInvestors(processedInvestors);
      
      // Portföyleri izlemek için çekiyoruz
      processedInvestors.forEach(inv => fetchPortfolio(inv.id));
      setLoading(false);
    } catch (err) {
      console.error("Veri çekme hatası:", err);
      setLoading(false);
    }
  };

  const fetchPortfolio = async (id) => {
    try {
      const res = await api.get(`/users/${id}/portfolio`);
      setPortfolios(prev => ({ ...prev, [id]: res.data }));
    } catch (err) {
      console.error("Portföy detay hatası:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  if (loading) return <div className="loading">Yatırımcı Verileri Yükleniyor...</div>;

  return (
    <div className="admin-wrapper">
      <AdvisorSidebar />
      <main className="admin-main">
        <header className="page-header">
          <h1>Yatırımcı Portföyleri</h1>
          <p>Sorumluluğunuzdaki yatırımcıların güncel varlık durumlarını buradan takip edebilirsiniz.</p>
        </header>

        <div className="admin-content">
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>TC KİMLİK</th>
                  <th>AD SOYAD</th>
                  <th>İLETİŞİM</th>
                  <th>VARLIK DETAYLARI</th>
                  <th>TOPLAM LOT</th>
                </tr>
              </thead>


<tbody>
  {investors.map(inv => (
    <tr key={inv.id}>
      <td>{inv.tcNo}</td>
      <td className="text-highlight">{inv.firstName} {inv.lastName}</td>
      <td>{inv.email}</td>
      <td>
        {portfolios[inv.id] && portfolios[inv.id].length > 0 ? (
          <div className="portfolio-badges">
            {portfolios[inv.id].map(p => (
              <span key={p.id} className="badge-fon-view">
               
                {p.fundCode}: {p.lotCount ? parseFloat(p.lotCount).toFixed(4) : "0.0000"} Lot
              </span>
            ))}
          </div>
        ) : (
          <span className="no-asset">Varlık Bulunmuyor</span>
        )}
      </td>
      <td style={{ fontWeight: 'bold', color: '#10b981' }}>
          {portfolios[inv.id]?.reduce((acc, curr) => {
          const lotValue = parseFloat(curr.lotCount) || 0;
          return acc + lotValue;
        }, 0).toFixed(4) || "0.0000"}
      </td>
    </tr>
  ))}
</tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdvisorYatirimcilar;
import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import './Danismanlar.css';

const Danismanlar = () => {
  const { token } = useAuth();
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);

  useEffect(() => {
    if (token) fetchAdvisors();
  }, [token]);

  const fetchAdvisors = async () => {
    try {
      const res = await api.get('/users/advisors');
      setAdvisors(res.data);
    } catch (err) {
      console.error("Danışmanlar getirilirken hata oluştu:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <main className="admin-main">
        <header className="page-header">
          <h1>Danışman Listesi</h1>
          <p>Sistemdeki tüm danışmanların iletişim ve fon performans bilgileri.</p>
        </header>

        <div className="admin-content">
          <div className="table-container">
            {loading ? (
              <div className="no-data-msg">Danışmanlar yükleniyor...</div>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>TC Kimlik No</th>
                    <th>Ad Soyad</th>
                    <th>E-Posta</th>
                    <th>Telefon</th>
                    <th>Sorumlu Olduğu Fon</th>
                    <th>Fon Kâr/Zarar</th>
                  </tr>
                </thead>
                <tbody>
                  {advisors.map((adv, index) => {
                    const profitValue = parseFloat(adv.performance) || 0;
                    const isProfit = profitValue >= 0;

                    return (
                      <tr
                        key={adv.tcNo || index}
                        onClick={() => setSelectedAdvisor(adv)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>{adv.tcNo}</td>
                        <td>{adv.fullName}</td>
                        <td>{adv.email}</td>
                        <td>{adv.phone || '---'}</td>
                        <td>
                          <span className={`badge-fon ${adv.managedFund}`}>
                            {adv.managedFund || "Atama Bekliyor"}
                          </span>
                        </td>
                        <td className={isProfit ? "text-profit" : "text-loss"}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
                            {isProfit ? '↑' : '↓'} %{Math.abs(profitValue).toFixed(2)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            {!loading && advisors.length === 0 && (
              <div className="no-data-msg">Henüz sistemde onaylı danışman bulunmuyor.</div>
            )}
          </div>
        </div>

        {/* Danışman Profil Detay Paneli */}
        {selectedAdvisor && (
          <div className="advisor-modal-overlay" onClick={() => setSelectedAdvisor(null)}>
            <div className="advisor-modal" onClick={e => e.stopPropagation()}>
              <div className="advisor-modal-header">
                <div className="advisor-avatar">
                  {selectedAdvisor.fullName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <h2 className="advisor-modal-name">{selectedAdvisor.fullName}</h2>
                  <span className="advisor-modal-role">
                    {selectedAdvisor.role === 'ADMIN' ? 'Yönetici' : 'Danışman'}
                    {selectedAdvisor.managedFund && ` · ${selectedAdvisor.managedFund}`}
                  </span>
                </div>
                <button className="advisor-modal-close" onClick={() => setSelectedAdvisor(null)}>✕</button>
              </div>

              <div className="advisor-modal-body">
                <div className="advisor-info-grid">
                  <div className="advisor-info-item">
                    <span className="advisor-info-label">TC Kimlik No</span>
                    <span className="advisor-info-value">{selectedAdvisor.tcNo}</span>
                  </div>
                  <div className="advisor-info-item">
                    <span className="advisor-info-label">E-Posta</span>
                    <span className="advisor-info-value">{selectedAdvisor.email}</span>
                  </div>
                  <div className="advisor-info-item">
                    <span className="advisor-info-label">Telefon</span>
                    <span className="advisor-info-value">{selectedAdvisor.phone || '---'}</span>
                  </div>
                  <div className="advisor-info-item">
                    <span className="advisor-info-label">Sorumlu Fon</span>
                    <span className="advisor-info-value">
                      <span className="badge-fon">{selectedAdvisor.managedFund || 'Atanmamış'}</span>
                    </span>
                  </div>
                  <div className="advisor-info-item">
                    <span className="advisor-info-label">Fon Performansı</span>
                    <span className={`advisor-info-value ${parseFloat(selectedAdvisor.performance) >= 0 ? 'text-profit' : 'text-loss'}`}>
                      {parseFloat(selectedAdvisor.performance) >= 0 ? '↑' : '↓'} %{Math.abs(parseFloat(selectedAdvisor.performance) || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="advisor-desc-section">
                  <span className="advisor-info-label">Hakkında / Açıklama</span>
                  <div className="advisor-desc-box">
                    {selectedAdvisor.description
                      ? selectedAdvisor.description
                      : 'Danışman henüz bir açıklama yazmamış.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Danismanlar;

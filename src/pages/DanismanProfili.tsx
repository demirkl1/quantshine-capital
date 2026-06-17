// @ts-nocheck
import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import InvestorSidebar from '../components/InvestorSidebar';
import { MdEmail, MdWork, MdAccountCircle, MdArrowDropDown } from 'react-icons/md';
import './DanismanProfili.css';

const DanismanProfili = () => {
  const { isAuthenticated } = useAuth();
  const [advisors, setAdvisors] = useState([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdvisors = async () => {
      try {
        const res = await api.get('/users/my-advisors-profiles');
        const raw = Array.isArray(res.data) ? res.data : [];
        const seen = new Map();
        raw.forEach(item => {
          if (!item) return;
          const adv = item.advisor ?? item;
          if (!adv || adv.id == null || seen.has(adv.id)) return;
          seen.set(adv.id, adv);
        });
        const list = Array.from(seen.values());
        setAdvisors(list);
        if (list.length > 0) setSelectedAdvisor(list[0]);
      } catch (err) {
        console.error(
          "Danışman profilleri yüklenemedi:",
          err.response?.status,
          err.response?.data || err.message
        );
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) fetchAdvisors();
  }, [isAuthenticated]);


  const handleSelectChange = (e) => {
    const selectedId = e.target.value;
    const adv = advisors.find(a => String(a.id) === String(selectedId));
    setSelectedAdvisor(adv);
  };
  if (loading) return <div className="loading">Profil Bilgileri Yükleniyor...</div>;

  return (
    <div className="admin-wrapper">
      <InvestorSidebar />
      <main className="admin-main">
        <header className="page-header">
          <h1>Danışman Profili</h1>
          <p>Yatırımlarınızı yöneten uzmanların iletişim ve uzmanlık bilgileri.</p>
        </header>

        <div className="admin-content">
          <div className="profile-selection-container">
            <div className="advisor-select-box">
              <label><MdAccountCircle /> Bilgilerini Görüntülemek İstediğiniz Danışmanı Seçin</label>
              <div className="select-wrapper">
                <select 
  className="combobox" 
  value={selectedAdvisor?.id || ""} 
  onChange={handleSelectChange}
>
  {advisors.map(adv => (
    <option key={adv.id} value={adv.id}>
      {adv.firstName} {adv.lastName}
    </option>
  ))}
</select>
                <MdArrowDropDown className="select-icon" />
              </div>
            </div>

            {selectedAdvisor ? (
              <div className="advisor-profile-card">
                <div className="advisor-card-header">
                  <div className="advisor-avatar large">
                    {selectedAdvisor.firstName?.[0] || ''}{selectedAdvisor.lastName?.[0] || ''}
                  </div>
                  <div className="advisor-main-info">
                    <h2>{selectedAdvisor.firstName} {selectedAdvisor.lastName}</h2>
                    <span className="advisor-badge">Sertifikalı Portföy Yöneticisi</span>
                  </div>
                </div>

                <div className="advisor-details-grid">
                  <div className="info-item">
                    <div className="info-icon"><MdEmail /></div>
                    <div className="info-text">
                      <label>E-Posta Adresi</label>
                      <p>{selectedAdvisor.email}</p>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon"><MdWork /></div>
                    <div className="info-text">
                      <label>Sorumlu Olduğu Fon</label>
                      <p className="text-highlight">
                        {selectedAdvisor.managedFundCode || "Genel Portföy"}
                      </p>
                    </div>
                  </div>

                  <div className="info-item full-width-info">
                    <div className="info-text">
                      <label>Uzmanlık ve Hakkında</label>
                      <p className="description-text">
                        {selectedAdvisor.description || "Danışman henüz bir profil açıklaması eklememiş."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-advisor-alert">
                Henüz size atanmış bir danışman bulunmamaktadır.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DanismanProfili;
import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import toast from 'react-hot-toast';
import './Yatirimcilar.css';

const Yatirimcilar = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('tum');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [selectedYatirimci, setSelectedYatirimci] = useState(null);
  const [currentUnitPrice, setCurrentUnitPrice] = useState(0);
  const [currentFundCode, setCurrentFundCode] = useState("");
  
  const [investors, setInvestors] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [portfolios, setPortfolios] = useState({});
  const [allAvailableFunds, setAllAvailableFunds] = useState([]);

  const [targetAdvisorTc, setTargetAdvisorTc] = useState('');
  const [selectedFundCode, setSelectedFundCode] = useState('');
  const [tradeTab, setTradeTab] = useState('alis');
  const [price, setPrice] = useState('');
  const [lot, setLot] = useState(0);
  const [isTransferMode, setIsTransferMode] = useState(true);

 const fetchData = async () => {
    if (!token) return;
    setInvestors([]); // Tab değişince eski veriyi temizle

    try {
        const invUrl = activeTab === 'tum'
            ? '/trade/all-investors-detailed'
            : '/users/my-investors';

        const [invRes, advRes] = await Promise.all([
            api.get(invUrl),
            api.get('/users/advisors')
        ]);
        
        let rawData = Array.isArray(invRes.data) ? invRes.data : [];
        if (activeTab === 'benim') {
            // my-investors -> investor nesnelerini çıkar ve holdings ekle
            rawData = rawData.map(relation => {
                const investor = relation.investor;
                return {
                    ...investor,
                    holdings: [{
                        fundCode: relation.fundCode,
                        lots: relation.lotCount,
                        tlValue: relation.balance, // Backend'den gelen balance zaten güncel değer
                        id: relation.id
                    }],
                    totalPortfolioValue: relation.balance
                };
            });
            
            // Aynı yatırımcının birden fazla fonu varsa birleştir
            const investorMap = new Map();
            rawData.forEach(inv => {
                if (investorMap.has(inv.tcNo)) {
                    const existing = investorMap.get(inv.tcNo);
                    existing.holdings.push(...inv.holdings);
                    existing.totalPortfolioValue += inv.totalPortfolioValue;
                } else {
                    investorMap.set(inv.tcNo, inv);
                }
            });
            rawData = Array.from(investorMap.values());
        }
        
        setInvestors(rawData);
        setAdvisors(Array.isArray(advRes.data) ? advRes.data : []);
        
        // Portföyleri state'e kaydet
        const newPortfolios = {};
        rawData.forEach(inv => {
            if (inv && inv.holdings) {
                if (inv.id) newPortfolios[inv.id] = inv.holdings;
                if (inv.tcNo) newPortfolios[inv.tcNo] = inv.holdings;
            }
        });
        setPortfolios(newPortfolios);

    } catch (err) {
        console.error("Veri çekme hatası:", err);
    }
};
const fetchAllFunds = async () => {
    try {
        const res = await api.get('/funds');
        setAllAvailableFunds(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
        console.error("Tüm fonlar çekilemedi:", err);
    }
};
useEffect(() => {
  if (token) {
    fetchData();
    fetchAllFunds();
  }
}, [token, activeTab]);

const handleAdvisorChange = (e) => {
    const selectedTc = e.target.value;
    setTargetAdvisorTc(selectedTc);

    if (!selectedTc) {
        setSelectedFundCode("");
        return;
    }

    const advisor = advisors.find(a => String(a.tcNo) === String(selectedTc));
    if (advisor && advisor.managedFund) {
        setSelectedFundCode(advisor.managedFund.toUpperCase());
    } else {
        setSelectedFundCode("-"); 
    }
};

  const fetchPortfolio = async (id) => {
    try {
      const res = await api.get(`/users/${id}/portfolio`);
      setPortfolios(prev => ({ ...prev, [id]: res.data }));
    } catch (err) {
      console.error("Portföy çekilemedi:", id, err);
    }
  };

  // 1. Sadece Modal açıldığında veya yatırımcı değiştiğinde veriyi hazırla
useEffect(() => {
  const fetchActualPrice = async () => {
    if (!showTradeModal || !selectedYatirimci) return;

    const investorPortfolio = portfolios[selectedYatirimci.id] || [];
    let targetFund = currentFundCode || (investorPortfolio.length > 0 ? investorPortfolio[0].fundCode : "TEK");

    try {
      const res = await api.get(`/funds/${targetFund}`);
      setCurrentUnitPrice(res.data.currentPrice);
      if (!currentFundCode) setCurrentFundCode(targetFund);
    } catch (err) {
      console.error("Fiyat çekilemedi:", err);
      setCurrentUnitPrice(0);
    }
  };

  fetchActualPrice();
}, [showTradeModal, selectedYatirimci, currentFundCode, token]);

useEffect(() => {
  const numericAmount = parseFloat(price);
  const numericUnitPrice = parseFloat(currentUnitPrice);

  if (numericAmount > 0 && numericUnitPrice > 0) {
    setLot((numericAmount / numericUnitPrice).toFixed(4));
  } else {
    setLot(0);
  }
}, [price, currentUnitPrice]);

const handleAssign = async () => {
  if (!targetAdvisorTc || !selectedFundCode) { toast.error("Eksik alan!"); return; }
  
  try {
    await api.put('/users/assign-investment', null, {
      params: {
        investorTc: selectedYatirimci.tcNo,
        advisorTc: targetAdvisorTc,
        fundCode: selectedFundCode,
        isTransfer: isTransferMode
      }
    });
    
    toast.success(isTransferMode ? "Danışman başarıyla transfer edildi!" : "Yatırımcı yeni bir fona dahil edildi!");
    setShowTransferModal(false);
    fetchData(); // Listeyi yenile
  } catch (err) { 
    toast.error(err.response?.data || "İşlem başarısız!");
  }
};
  const handleTradeSubmit = async () => {
  if (!price || parseFloat(price) <= 0) { toast.error("Lütfen geçerli bir tutar girin!"); return; }

  try {
    const cleanAmount = parseFloat(price).toFixed(2);

    await api.post('/trade/execute', {
      investorTc: selectedYatirimci.tcNo,
      fundCode: currentFundCode,
      amount: cleanAmount,
      type: tradeTab === 'alis' ? 'BUY' : 'SELL'
    });

    toast.success("İşlem Başarılı!");
    setShowTradeModal(false);
    setPrice(''); // Inputu temizle
    fetchData(); // Dashboard'u yenile
  } catch (err) {
    toast.error("Hata: " + (err.response?.data || "İşlem başarısız"));
  }
};

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <main className="admin-main">
        <header className="page-header">
          <h1>Yatırımcı Yönetimi</h1>
          <div className="tab-container">
            <button className={`tab-btn ${activeTab === 'tum' ? 'active' : ''}`} onClick={() => setActiveTab('tum')}>Tüm Yatırımcılar</button>
            <button className={`tab-btn ${activeTab === 'benim' ? 'active' : ''}`} onClick={() => setActiveTab('benim')}>Yatırımcılarım</button>
          </div>
        </header>

        <div className="admin-content">
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>TC</th>
                  <th>AD SOYAD</th>
                  <th>İLETİŞİM</th>
                  <th>MEVCUT DANIŞMANLAR</th>
                  <th>İŞLEM</th>
                </tr>
              </thead>
<tbody>
  {investors.map((inv) => (
    <tr key={inv.tcNo}>
      <td>{inv.tcNo}</td>
      <td>{inv.fullName}</td>
      <td>{inv.email}</td>
      <td>
        {inv.holdings && inv.holdings.length > 0 ? (
          <div className="portfolio-summary-container" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {inv.holdings.map((h, index) => {
              const guncelDeger = h.tlValue;
              const lotSayisi = h.lots;

              return (
                <div key={index} className="fund-detail-card" style={{ 
                  background: '#1e293b', 
                  padding: '10px', 
                  borderRadius: '8px',
                  borderLeft: '4px solid #10b981' 
                }}>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '5px' }}>
                    <strong>{h.fundCode}</strong> | {lotSayisi.toLocaleString()} Lot
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#fff', fontWeight: 'bold' }}>Güncel Değer:</span>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>₺{guncelDeger.toLocaleString('tr-TR')}</span>
                  </div>
                </div>
              );
            })}

            <div style={{
              marginTop: '5px', 
              padding: '10px', 
              background: '#0f172a', 
              borderRadius: '6px', 
              border: '1px solid #334155' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#f59e0b', fontWeight: 'bold' }}>
                <span>Toplam Portföy:</span>
                <span>₺{inv.totalPortfolioValue.toLocaleString('tr-TR')}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="atama-yok" style={{ color: '#64748b', fontStyle: 'italic' }}>Varlık Bulunmuyor</div>
        )}
      </td>
      <td className="actions-cell">
        <button className="btn-transfer" onClick={() => { setSelectedYatirimci(inv); setShowTransferModal(true); }}>
          Danışman Ekle
        </button>
        <button className="btn-transfer" style={{background: '#4f46e5', marginLeft: '5px'}} onClick={() => { setSelectedYatirimci(inv); setShowTradeModal(true); }}>
          Yatırım Yap / Çek
        </button>
      </td>
    </tr>
  ))}
</tbody>
            </table>
          </div>
        </div>

{showTransferModal && (
  <div className="modal-overlay" onClick={() => setShowTransferModal(false)}>
    <div className="transfer-modal" onClick={e => e.stopPropagation()}>
      
      <div className="trade-tabs">
        <button 
          className={isTransferMode ? "active" : ""} 
          onClick={() => setIsTransferMode(true)}
        >
          Transfer
        </button>
        <button 
          className={!isTransferMode ? "active" : ""} 
          onClick={() => setIsTransferMode(false)}
        >
          Yeni Kayıt
        </button>
      </div>

      <div className="modal-info-text">
        {isTransferMode 
          ? "Mevcut fonunuzdaki danışmanı başka bir danışmanla değiştirir." 
          : "Yatırımcıyı farklı bir fon grubuna ve danışmana dahil eder."}
      </div>

      <div className="form-group" style={{marginTop: '20px'}}>
  <label>Danışman Seçin</label>
  <select 
    className="combobox" 
    value={targetAdvisorTc} 
    onChange={handleAdvisorChange} 
  >
    <option value="">Seçiniz...</option>
    {advisors.map(adv => (
      <option key={adv.tcNo} value={adv.tcNo}>
        {adv.fullName || "İsimsiz Danışman"} ({adv.managedFund || "Fon Yok"})
      </option>
    ))}
  </select>
</div>

      <div className="form-group" style={{marginTop: '15px'}}>
        <label>Atanacak Fon (Otomatik)</label>
        <input 
          type="text" 
          className="combobox" 
          value={
            selectedFundCode === "HSF" ? "Hisse Senedi Fonu (HSF)" : 
            selectedFundCode === "TEK" ? "Teknoloji Fonu (TEK)" : 
            selectedFundCode || "-"
          } 
          disabled 
          readOnly
          style={{ 
            backgroundColor: '#0f172a', 
            color: selectedFundCode === "-" ? '#ef4444' : '#10b981', 
            fontWeight: 'bold' 
          }}
        />
      </div>

      <div className="modal-actions">
        <button 
          className="btn-save" 
          onClick={handleAssign}
          // Seçili fon yoksa veya danışman fonu "-" ise butonu kilitliyoruz
          disabled={!selectedFundCode || selectedFundCode === "-"}
          style={{ 
            opacity: (!selectedFundCode || selectedFundCode === "-") ? 0.5 : 1,
            background: isTransferMode ? '#4f46e5' : '#10b981' 
          }}
        >
          {isTransferMode ? "Transferi Onayla" : "Yeni Kayıt Oluştur"}
        </button>
        <button className="btn-cancel" onClick={() => setShowTransferModal(false)}>İptal</button>
      </div>
    </div>
  </div>
)}

{showTradeModal && (
  <div className="modal-overlay" onClick={() => setShowTradeModal(false)}>
    <div className="transfer-modal" onClick={e => e.stopPropagation()}>
      <div className="trade-tabs">
        <button 
          className={tradeTab === 'alis' ? 'active' : ''} 
          onClick={() => setTradeTab('alis')}
        >
          Alış
        </button>
        <button 
          className={tradeTab === 'satis' ? 'active' : ''} 
          onClick={() => setTradeTab('satis')}
        >
          Satış
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <div className="form-group">
          <label>İşlem Yapılacak Fonu Seçin</label>
          <select 
            className="combobox"
            value={currentFundCode}
            onChange={(e) => setCurrentFundCode(e.target.value)}
          >
            <option value="">Seçiniz...</option>
            {allAvailableFunds.map(fund => (
              <option key={fund.id} value={fund.fundCode}>
                {fund.fundCode} - {fund.fundName}
              </option>
            ))}
          </select>
        </div>
        
        <div className="price-info-box" style={{ marginTop: '15px' }}>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
            Seçili Fon: <strong style={{ color: '#10b981' }}>{currentFundCode || "Seçilmedi"}</strong>
          </p>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
            Birim Fiyat: <strong style={{ color: '#fff' }}>
              {currentUnitPrice && currentUnitPrice > 0 ? `${currentUnitPrice.toFixed(4)} TL` : "Fiyat bekleniyor..."}
            </strong>
          </p>
        </div>

        <div className="form-group" style={{ marginTop: '15px' }}>
          <label>Tutar (TL)</label>
          <input 
            type="number" 
            className="combobox" 
            value={price} 
            onChange={(e) => setPrice(e.target.value)} 
            placeholder="0.00" 
          />
        </div>

        <div className="form-group" style={{ marginTop: '15px' }}>
          <label>Hesaplanan Lot</label>
          <input 
            type="text" 
            className="combobox" 
            value={lot} 
            disabled 
            style={{ opacity: 0.6, backgroundColor: '#1e293b' }} 
          />
        </div>

        <div className="modal-actions">
          <button 
            className="btn-save" 
            style={{ background: tradeTab === 'alis' ? '#10b981' : '#ef4444' }} 
            onClick={handleTradeSubmit}
            disabled={!currentFundCode || currentUnitPrice <= 0}
          >
            {tradeTab === 'alis' ? 'Satın Al' : 'Geri Sat'}
          </button>
          <button className="btn-cancel" onClick={() => setShowTradeModal(false)}>Kapat</button>
        </div>
      </div>
    </div>
  </div>
)}
      </main>
    </div>
  );
};

export default Yatirimcilar;
import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
  const [selectedDetailInvestor, setSelectedDetailInvestor] = useState(null);

  const [targetAdvisorTc, setTargetAdvisorTc] = useState('');
  const [selectedFundCode, setSelectedFundCode] = useState('');
  const [tradeTab, setTradeTab] = useState('alis');
  const [price, setPrice] = useState('');
  const [lot, setLot] = useState(0);
  const [modalMode, setModalMode] = useState('transfer'); // 'transfer' | 'kayit' | 'bosalt'

  const [deleteTarget, setDeleteTarget] = useState(null);   // silinecek yatırımcı
  const [deleteStep, setDeleteStep] = useState(1);          // 1: uyarı, 2: TC onayı
  const [deleteInput, setDeleteInput] = useState('');
  const [deleting, setDeleting] = useState(false);

  const [investorHistory, setInvestorHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [detailTab, setDetailTab] = useState('genel');

  const PIE_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

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

// Detay modalı açıldığında o yatırımcının işlem geçmişini çek
useEffect(() => {
  if (!selectedDetailInvestor) return;
  setDetailTab('genel');
  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get('/trade/all-history');
      const filtered = (Array.isArray(res.data) ? res.data : []).filter(
        item => String(item.investorTc) === String(selectedDetailInvestor.tcNo)
      );
      setInvestorHistory(filtered);
    } catch (err) {
      console.error("İşlem geçmişi alınamadı:", err);
      setInvestorHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };
  fetchHistory();
}, [selectedDetailInvestor?.tcNo]);

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
    if (!showTradeModal || !selectedYatirimci || !currentFundCode) return;

    try {
      const res = await api.get(`/funds/${currentFundCode}`);
      setCurrentUnitPrice(res.data.price ?? res.data.currentPrice ?? 0);
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
        isTransfer: modalMode === 'transfer'
      }
    });

    toast.success(modalMode === 'transfer' ? "Danışman başarıyla transfer edildi!" : "Yatırımcı yeni bir fona dahil edildi!");
    setShowTransferModal(false);
    fetchData();
  } catch (err) {
    toast.error(err.response?.data || "İşlem başarısız!");
  }
};

  const handleDeleteInvestor = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/users/${deleteTarget.tcNo}`);
      toast.success(`${deleteTarget.fullName} sistemden silindi.`);
      setDeleteTarget(null);
      setDeleteStep(1);
      setDeleteInput('');
      setSelectedDetailInvestor(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data || 'Yatırımcı silinemedi.');
    } finally {
      setDeleting(false);
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
    <tr key={inv.tcNo} onClick={() => setSelectedDetailInvestor(inv)} style={{ cursor: 'pointer' }}>
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
                    <strong>{h.fundCode}</strong> | {Number(lotSayisi || 0).toLocaleString('tr-TR', { minimumFractionDigits: 4 })} Lot
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#fff', fontWeight: 'bold' }}>Güncel Değer:</span>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>₺{Number(guncelDeger || 0).toLocaleString('tr-TR')}</span>
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
        <button className="btn-transfer" onClick={(e) => { e.stopPropagation(); setSelectedYatirimci(inv); setShowTransferModal(true); }}>
          Danışman Ekle
        </button>
        <button className="btn-transfer" style={{background: '#4f46e5', marginLeft: '5px'}} onClick={(e) => { e.stopPropagation(); setSelectedYatirimci(inv); setShowTradeModal(true); }}>
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
  <div className="modal-overlay" onClick={() => { setShowTransferModal(false); setTargetAdvisorTc(''); setSelectedFundCode(''); }}>
    <div className="transfer-modal" onClick={e => e.stopPropagation()}>

      <div className="trade-tabs">
        <button
          className={modalMode === 'transfer' ? 'active' : ''}
          onClick={() => { setModalMode('transfer'); setTargetAdvisorTc(''); setSelectedFundCode(''); }}
        >
          Transfer
        </button>
        <button
          className={modalMode === 'kayit' ? 'active' : ''}
          onClick={() => { setModalMode('kayit'); setTargetAdvisorTc(''); setSelectedFundCode(''); }}
        >
          Yeni Kayıt
        </button>
      </div>

      <div className="modal-info-text">
        {modalMode === 'transfer' && "Mevcut fonunuzdaki danışmanı başka bir danışmanla değiştirir."}
        {modalMode === 'kayit'    && "Yatırımcıyı farklı bir fon grubuna ve danışmana dahil eder."}
      </div>

      <div className="form-group" style={{ marginTop: '20px' }}>
        <label>Danışman Seçin</label>
        <select className="combobox" value={targetAdvisorTc} onChange={handleAdvisorChange}>
          <option value="">Seçiniz...</option>
          {advisors.map(adv => (
            <option key={adv.tcNo} value={adv.tcNo}>
              {adv.fullName || "İsimsiz Danışman"} ({adv.managedFund || "Fon Yok"})
            </option>
          ))}
        </select>
      </div>

      <div className="form-group" style={{ marginTop: '15px' }}>
        <label>Atanacak Fon (Otomatik)</label>
        <input
          type="text"
          className="combobox"
          value={selectedFundCode || "-"}
          disabled
          readOnly
          style={{
            backgroundColor: '#0f172a',
            color: (!selectedFundCode || selectedFundCode === '-') ? '#ef4444' : '#10b981',
            fontWeight: 'bold'
          }}
        />
      </div>

      <div className="modal-actions">
        <button
          className="btn-save"
          onClick={handleAssign}
          disabled={!selectedFundCode || selectedFundCode === '-'}
          style={{
            opacity: (!selectedFundCode || selectedFundCode === '-') ? 0.5 : 1,
            background: modalMode === 'transfer' ? '#4f46e5' : '#10b981'
          }}
        >
          {modalMode === 'transfer' ? "Transferi Onayla" : "Yeni Kayıt Oluştur"}
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
              <option key={fund.code} value={fund.code}>
                {fund.code} - {fund.name}
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

      {/* ── Yatırımcı Silme Onay Modalı ── */}
      {deleteTarget && (
        <div className="advisor-modal-overlay" onClick={() => { setDeleteTarget(null); setDeleteStep(1); setDeleteInput(''); }}>
          <div className="investor-delete-modal" onClick={e => e.stopPropagation()}>

            {deleteStep === 1 ? (
              <>
                <div className="delete-modal-icon">⚠</div>
                <h2 className="delete-modal-title">Bu işlem geri alınamaz</h2>
                <p className="delete-modal-subtitle">
                  <strong style={{ color: '#f1f5f9' }}>{deleteTarget.fullName}</strong> adlı yatırımcının hesabı kalıcı olarak silinecektir.
                </p>

                <div className="delete-warning-box">
                  <p className="delete-warning-head">Silinecekler:</p>
                  <ul className="delete-warning-list">
                    <li>Kullanıcı hesabı ve giriş bilgileri</li>
                    <li>Danışman atamaları</li>
                    <li>Fon kaydı ve lot bilgileri</li>
                  </ul>
                  <p className="delete-warning-keep">İşlem geçmişi arşiv amaçlı korunacaktır.</p>
                </div>

                <div className="delete-modal-actions">
                  <button className="btn-delete-next" onClick={() => setDeleteStep(2)}>
                    Anladım, Devam Et →
                  </button>
                  <button className="btn-delete-cancel" onClick={() => { setDeleteTarget(null); setDeleteStep(1); setDeleteInput(''); }}>
                    Vazgeç
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="delete-modal-icon" style={{ background: 'rgba(239,68,68,0.15)' }}>🗑</div>
                <h2 className="delete-modal-title">Silmeyi Onayla</h2>
                <p className="delete-modal-subtitle">
                  İşlemi onaylamak için aşağıya yatırımcının TC kimlik numarasını yazın:
                </p>

                <div className="delete-confirm-tc">
                  <span className="delete-confirm-tc-label">TC:</span>
                  <span className="delete-confirm-tc-value">{deleteTarget.tcNo}</span>
                </div>

                <input
                  className="delete-confirm-input"
                  type="text"
                  placeholder="TC kimlik numarasını buraya girin..."
                  value={deleteInput}
                  onChange={e => setDeleteInput(e.target.value)}
                  autoFocus
                />

                {deleteInput && deleteInput !== String(deleteTarget.tcNo) && (
                  <p className="delete-input-error">TC numarası eşleşmiyor</p>
                )}

                <div className="delete-modal-actions">
                  <button
                    className="btn-delete-final"
                    disabled={deleteInput !== String(deleteTarget.tcNo) || deleting}
                    onClick={handleDeleteInvestor}
                  >
                    {deleting ? 'Siliniyor...' : 'Hesabı Kalıcı Sil'}
                  </button>
                  <button className="btn-delete-cancel" onClick={() => { setDeleteTarget(null); setDeleteStep(1); setDeleteInput(''); }}>
                    Vazgeç
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Yatırımcı Detay Modalı ── */}
      {selectedDetailInvestor && (() => {
        const sortedHist = [...investorHistory].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        const ilkTarih = sortedHist[0]?.createdAt;
        const sonTarih = sortedHist[sortedHist.length - 1]?.createdAt;
        const pieData = (selectedDetailInvestor.holdings || [])
          .filter(h => (h.tlValue || 0) > 0)
          .map(h => ({ name: h.fundCode, value: h.tlValue || 0 }));
        const totalVal = pieData.reduce((s, d) => s + d.value, 0);

        return (
          <div className="advisor-modal-overlay" onClick={() => setSelectedDetailInvestor(null)}>
            <div className="advisor-modal investor-detail-modal" onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="advisor-modal-header">
                <div className="advisor-avatar" style={{ background: '#10b981' }}>
                  {selectedDetailInvestor.fullName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <h2 className="advisor-modal-name">{selectedDetailInvestor.fullName}</h2>
                  <span className="advisor-modal-role">Yatırımcı · {selectedDetailInvestor.tcNo}</span>
                </div>
                <button className="advisor-modal-close" onClick={() => setSelectedDetailInvestor(null)}>✕</button>
              </div>

              {/* Sekmeler */}
              <div className="investor-detail-tabs">
                <button className={`investor-detail-tab ${detailTab === 'genel' ? 'active' : ''}`} onClick={() => setDetailTab('genel')}>Genel Bakış</button>
                <button className={`investor-detail-tab ${detailTab === 'gecmis' ? 'active' : ''}`} onClick={() => setDetailTab('gecmis')}>
                  İşlem Geçmişi {investorHistory.length > 0 && <span className="history-count-badge">{investorHistory.length}</span>}
                </button>
              </div>

              {/* Body */}
              <div className="advisor-modal-body">

                {detailTab === 'genel' && (
                  <>
                    {/* Kişisel bilgiler */}
                    <div className="advisor-info-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                      <div className="advisor-info-item">
                        <span className="advisor-info-label">TC Kimlik No</span>
                        <span className="advisor-info-value">{selectedDetailInvestor.tcNo}</span>
                      </div>
                      <div className="advisor-info-item">
                        <span className="advisor-info-label">E-Posta</span>
                        <span className="advisor-info-value">{selectedDetailInvestor.email}</span>
                      </div>
                      <div className="advisor-info-item">
                        <span className="advisor-info-label">Telefon</span>
                        <span className="advisor-info-value">{selectedDetailInvestor.phone || '---'}</span>
                      </div>
                      <div className="advisor-info-item">
                        <span className="advisor-info-label">İlk Yatırım Tarihi</span>
                        <span className="advisor-info-value">
                          {ilkTarih ? new Date(ilkTarih).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }) : '---'}
                        </span>
                      </div>
                      <div className="advisor-info-item">
                        <span className="advisor-info-label">Son Yatırım Tarihi</span>
                        <span className="advisor-info-value">
                          {sonTarih ? new Date(sonTarih).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }) : '---'}
                        </span>
                      </div>
                      <div className="advisor-info-item">
                        <span className="advisor-info-label">Toplam Portföy</span>
                        <span className="advisor-info-value" style={{ color: '#f59e0b' }}>
                          ₺{Number(selectedDetailInvestor.totalPortfolioValue || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Pasta grafiği + fon pozisyonları */}
                    {pieData.length > 0 && (
                      <div className="investor-pie-section">
                        <span className="advisor-info-label" style={{ display: 'block', marginBottom: 10 }}>Portföy Dağılımı</span>
                        <div className="investor-pie-row">
                          <div style={{ width: 200, height: 200 }}>
                            <ResponsiveContainer>
                              <PieChart>
                                <Pie
                                  data={pieData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={50}
                                  outerRadius={80}
                                  paddingAngle={3}
                                  dataKey="value"
                                >
                                  {pieData.map((_, i) => (
                                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip
                                  contentStyle={{ background: '#131722', border: '1px solid #2a2e39', borderRadius: 8, color: '#fff', fontSize: 12 }}
                                  formatter={(value) => [`₺${Number(value).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, '']}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="investor-pie-legend">
                            {pieData.map((d, i) => (
                              <div key={i} className="pie-legend-item">
                                <span className="pie-legend-dot" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                <span className="pie-legend-code">{d.name}</span>
                                <span className="pie-legend-pct">%{totalVal > 0 ? ((d.value / totalVal) * 100).toFixed(1) : '0.0'}</span>
                                <span className="pie-legend-val">₺{Number(d.value).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Fon pozisyonları */}
                    {selectedDetailInvestor.holdings && selectedDetailInvestor.holdings.length > 0 && (
                      <div className="investor-holdings-section">
                        <span className="advisor-info-label" style={{ display: 'block', marginBottom: 10 }}>Fon Pozisyonları</span>
                        {selectedDetailInvestor.holdings.map((h, i) => (
                          <div key={i} className="investor-holding-card">
                            <div className="investor-holding-top">
                              <span className="investor-holding-code">{h.fundCode}</span>
                              <span className="investor-holding-lots">{Number(h.lots || 0).toLocaleString('tr-TR', { minimumFractionDigits: 4 })} Lot</span>
                            </div>
                            <div className="investor-holding-value">
                              <span style={{ color: '#787b86', fontSize: 11 }}>Güncel Değer</span>
                              <span style={{ color: '#10b981', fontWeight: 700 }}>
                                ₺{Number(h.tlValue || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {(!selectedDetailInvestor.holdings || selectedDetailInvestor.holdings.length === 0) && (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#434651', fontSize: 12 }}>
                        Bu yatırımcının henüz aktif fon pozisyonu bulunmuyor.
                      </div>
                    )}

                    {/* İşlem butonları */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                      <button className="btn-transfer" style={{ flex: 1 }} onClick={() => { setSelectedDetailInvestor(null); setSelectedYatirimci(selectedDetailInvestor); setShowTransferModal(true); }}>
                        Danışman Ekle / Transfer
                      </button>
                      <button className="btn-transfer" style={{ flex: 1, background: '#4f46e5' }} onClick={() => { setSelectedDetailInvestor(null); setSelectedYatirimci(selectedDetailInvestor); setShowTradeModal(true); }}>
                        Yatırım Yap / Çek
                      </button>
                    </div>

                    {/* Tehlikeli Alan */}
                    <div className="investor-danger-zone">
                      <span className="investor-danger-label">Tehlikeli Alan</span>
                      <button className="btn-delete-investor" onClick={() => { setDeleteTarget(selectedDetailInvestor); setDeleteStep(1); setDeleteInput(''); setSelectedDetailInvestor(null); }}>
                        Hesabı Kalıcı Sil
                      </button>
                    </div>
                  </>
                )}

                {detailTab === 'gecmis' && (
                  <div className="investor-history-section">
                    {historyLoading ? (
                      <div style={{ textAlign: 'center', padding: 30, color: '#94a3b8', fontSize: 13 }}>Geçmiş yükleniyor...</div>
                    ) : investorHistory.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: 30, color: '#434651', fontSize: 12 }}>Bu yatırımcıya ait işlem kaydı bulunamadı.</div>
                    ) : (
                      <table className="investor-history-table">
                        <thead>
                          <tr>
                            <th>Tarih</th>
                            <th>Fon</th>
                            <th>İşlem</th>
                            <th>Lot</th>
                            <th>Tutar</th>
                            <th>Birim Fiyat</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...investorHistory]
                            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                            .map((item, i) => (
                            <tr key={item.id || i}>
                              <td>{new Date(item.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                              <td><span className="investor-holding-code">{item.fundCode}</span></td>
                              <td><span className={`status-badge-small ${item.type === 'BUY' ? 'buy' : 'sell'}`}>{item.type === 'BUY' ? 'ALIŞ' : 'SATIŞ'}</span></td>
                              <td style={{ color: '#d1d4dc' }}>{Number(item.lotCount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 4 })}</td>
                              <td style={{ color: '#f59e0b', fontWeight: 700 }}>₺{Number(item.amount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                              <td style={{ color: '#94a3b8' }}>₺{Number(item.unitPrice || 0).toFixed(4)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Yatirimcilar;
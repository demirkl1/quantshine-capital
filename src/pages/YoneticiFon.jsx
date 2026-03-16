import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import toast from 'react-hot-toast';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import './YoneticiFon.css';

const YoneticiFon = () => {
  const { token } = useAuth();
  const [funds, setFunds] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("transfer");
  const [selectedFon, setSelectedFon] = useState(null);
  const [selectedAdvisorTc, setSelectedAdvisorTc] = useState("");
  const [targetFundCode, setTargetFundCode] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [newFund, setNewFund] = useState({ fundCode: '', fundName: '', currentPrice: '' });
  const [investors, setInvestors] = useState([]);
  const [selectedInvestorTc, setSelectedInvestorTc] = useState('');
  const [investorFundCode, setInvestorFundCode] = useState('');

  // Fon detay modalı
  const [selectedDetailFon, setSelectedDetailFon] = useState(null);
  const [detailFund, setDetailFund]         = useState(null);
  const [detailChartData, setDetailChartData] = useState([]);
  const [detailPeriod, setDetailPeriod]     = useState('1A');
  const [loadingDetail, setLoadingDetail]   = useState(false);

  const DETAIL_PERIODS = [
    { key: '1A', label: '1 Ay'  },
    { key: '3A', label: '3 Ay'  },
    { key: '6A', label: '6 Ay'  },
    { key: '1Y', label: '1 Yıl' },
    { key: '3Y', label: '3 Yıl' },
  ];

  // Fon detayını çek (bilgi + grafik)
  useEffect(() => {
    if (!selectedDetailFon) return;
    const ctrl = new AbortController();
    const fetchDetail = async () => {
      setLoadingDetail(true);
      setDetailFund(null);
      setDetailChartData([]);
      try {
        const [detailRes, histRes] = await Promise.all([
          api.get(`/funds/${selectedDetailFon.code}`, { signal: ctrl.signal }),
          api.get(`/funds/${selectedDetailFon.code}/history`, { params: { period: detailPeriod }, signal: ctrl.signal }),
        ]);
        setDetailFund(detailRes.data);
        setDetailChartData(Array.isArray(histRes.data) ? histRes.data : []);
      } catch (e) {
        if (e.name !== 'CanceledError' && e.name !== 'AbortError') console.error(e);
      } finally {
        setLoadingDetail(false);
      }
    };
    fetchDetail();
    return () => ctrl.abort();
  }, [selectedDetailFon, detailPeriod]);

  const fetchInitialData = async () => {
    try {
      const [fundRes, advisorRes, investorRes] = await Promise.all([
        api.get('/funds'),
        api.get('/users/advisors'),
        api.get('/trade/all-investors-detailed')
      ]);
      setFunds(fundRes.data);
      setAdvisors(advisorRes.data);
      setInvestors(Array.isArray(investorRes.data) ? investorRes.data : []);
    } catch (err) {
      console.error("Veriler yüklenemedi:", err);
    }
  };

  useEffect(() => {
    if (token) fetchInitialData();
  }, [token]);

  const handleOpenModal = (mode, fon = null) => {
    setModalMode(mode);
    setSelectedFon(fon);
    setSelectedAdvisorTc("");
    setTargetFundCode("");
    setSelectedInvestorTc("");
    setInvestorFundCode(fon?.code || "");
    setDeleting(false);
    setShowModal(true);
  };

  const handleCreateFund = async () => {
    try {
      const data = {
        fundCode: newFund.fundCode.toUpperCase(),
        fundName: newFund.fundName,
        currentPrice: parseFloat(newFund.currentPrice) || 0
      };
      await api.post('/funds', data);
      toast.success("Fon oluşturuldu!");
      setShowModal(false);
      setNewFund({ fundCode: '', fundName: '', currentPrice: '' });
      fetchInitialData();
    } catch (err) {
      toast.error("Hata: " + (err.response?.data || "Fon oluşturulamadı."));
    }
  };

  const handleTransferOrAssign = async () => {
    if (!selectedAdvisorTc) { toast.error("Lütfen bir danışman seçin!"); return; }

    const finalFundCode = modalMode === "transfer" ? targetFundCode : selectedFon.code;
    if (!finalFundCode) { toast.error("Hedef fon seçilmedi!"); return; }

    try {
      await api.put('/funds/assign-advisor', null, {
        params: { advisorTc: selectedAdvisorTc, fundCode: finalFundCode }
      });
      toast.success("Atama işlemi başarıyla tamamlandı!");
      setShowModal(false);
      fetchInitialData();
    } catch (err) {
      toast.error("Hata: " + (err.response?.data || "İşlem başarısız"));
    }
  };

  const handleUnassignAdvisor = async () => {
    if (!selectedAdvisorTc) { toast.error("Lütfen bir danışman seçin!"); return; }
    try {
      await api.put('/users/unassign-fund', null, {
        params: { advisorTc: selectedAdvisorTc }
      });
      toast.success("Danışman fondan çıkarıldı, artık boşta!");
      setShowModal(false);
      fetchInitialData();
    } catch (err) {
      toast.error(err.response?.data || "İşlem başarısız!");
    }
  };

  const handleDeleteFund = async () => {
    if (!selectedFon) return;
    setDeleting(true);
    try {
      await api.delete(`/funds/${selectedFon.code}`);
      toast.success(`${selectedFon.code} fonu silindi.`);
      setShowModal(false);
      fetchInitialData();
    } catch (err) {
      toast.error(err.response?.data || "Fon silinemedi.");
    } finally {
      setDeleting(false);
    }
  };

  const handleRemoveInvestorFromFund = async () => {
    if (!selectedInvestorTc) { toast.error("Lütfen bir yatırımcı seçin!"); return; }
    if (!investorFundCode) { toast.error("Lütfen bir fon seçin!"); return; }
    try {
      await api.delete('/users/remove-from-fund', {
        params: { investorTc: selectedInvestorTc, fundCode: investorFundCode }
      });
      toast.success("Yatırımcı fondan çıkarıldı!");
      setShowModal(false);
      fetchInitialData();
    } catch (err) {
      toast.error(err.response?.data || "İşlem başarısız!");
    }
  };

  const handleConfirm = () => {
    if (modalMode === "yeni-fon") return handleCreateFund();
    if (modalMode === "sil-fon") return handleDeleteFund();
    if (modalMode === "bosalt") return handleUnassignAdvisor();
    if (modalMode === "yatirimci-cikar") return handleRemoveInvestorFromFund();
    return handleTransferOrAssign();
  };

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <main className="admin-main">
        <header className="page-header">
          <div className="header-flex">
            <div>
              <h1>Fon Yönetimi</h1>
              <p>Sistemdeki aktif fonlar ve danışman işlemleri.</p>
            </div>
            <button className="btn-add-fund" onClick={() => handleOpenModal("yeni-fon")}>+ Yeni Fon Oluştur</button>
          </div>
        </header>

        <div className="admin-content">
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Fon Kodu</th>
                  <th>Fon Adı</th>
                  <th>Güncel Değer</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {funds.map(f => (
                  <tr key={f.code} onClick={() => { setSelectedDetailFon(f); setDetailPeriod('1A'); }} style={{ cursor: 'pointer' }}>
                    <td><span className="badge-fon-code">{f.code}</span></td>
                    <td><strong>{f.name}</strong></td>
                    <td>₺{f.price?.toLocaleString('tr-TR', { minimumFractionDigits: 4 })}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button className="btn-transfer-action" onClick={(e) => { e.stopPropagation(); handleOpenModal("transfer", f); }}>
                          Danışman İşlemleri
                        </button>
                        <button className="btn-investor-action" onClick={(e) => { e.stopPropagation(); handleOpenModal("yatirimci-cikar", f); }}>
                          Yatırımcı İşlemleri
                        </button>
                        <button className="btn-delete-fund" onClick={(e) => { e.stopPropagation(); handleOpenModal("sil-fon", f); }}>
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="fon-modal">
              {/* Danışman işlemleri için sekmeler */}
              {modalMode !== "yeni-fon" && modalMode !== "sil-fon" && modalMode !== "yatirimci-cikar" && (
                <div className="modal-tabs">
                  <button className={`modal-tab ${modalMode === "transfer" ? 'active' : ''}`} onClick={() => { setModalMode("transfer"); setSelectedAdvisorTc(""); setTargetFundCode(""); }}>Transfer</button>
                  <button className={`modal-tab ${modalMode === "yeni-danisman" ? 'active' : ''}`} onClick={() => { setModalMode("yeni-danisman"); setSelectedAdvisorTc(""); }}>Yeni Kayıt</button>
                  <button className={`modal-tab ${modalMode === "bosalt" ? 'active' : ''}`} onClick={() => { setModalMode("bosalt"); setSelectedAdvisorTc(""); }}>Boşa Al</button>
                </div>
              )}

              <div className="modal-body">
                {modalMode === "yeni-fon" ? (
                  <>
                    <h3 style={{ marginBottom: 16, color: '#e2e8f0' }}>Yeni Fon Oluştur</h3>
                    <div className="form-group">
                      <label>Fon Kodu (Örn: HSF)</label>
                      <input type="text" className="modal-input" value={newFund.fundCode} onChange={e => setNewFund({...newFund, fundCode: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Fon Adı</label>
                      <input type="text" className="modal-input" value={newFund.fundName} onChange={e => setNewFund({...newFund, fundName: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Başlangıç Fiyatı (₺)</label>
                      <input type="number" className="modal-input" step="0.01" value={newFund.currentPrice} onChange={e => setNewFund({...newFund, currentPrice: e.target.value})} />
                    </div>
                  </>

                ) : modalMode === "sil-fon" ? (
                  <>
                    <h3 style={{ marginBottom: 16, color: '#ef4444' }}>Fon Silme Onayı</h3>
                    <div style={{ background: '#1e293b', borderRadius: 8, padding: '16px', marginBottom: 16 }}>
                      <p style={{ color: '#94a3b8', marginBottom: 8 }}>Silinecek Fon:</p>
                      <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 18 }}>
                        <span className="badge-fon-code">{selectedFon?.code}</span> — {selectedFon?.name}
                      </p>
                    </div>
                    <div style={{ background: '#2d1515', border: '1px solid #ef4444', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
                      <p style={{ color: '#fca5a5', fontSize: 13 }}>
                        ⚠ Bu işlem geri alınamaz. Devam etmek için fonda:
                      </p>
                      <ul style={{ color: '#fca5a5', fontSize: 13, marginTop: 8, paddingLeft: 20 }}>
                        <li>Atanmış danışman <strong>olmamalıdır</strong></li>
                        <li>Aktif yatırımcı (lot &gt; 0) <strong>olmamalıdır</strong></li>
                      </ul>
                      <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 8 }}>
                        İşlem geçmişi ve fiyat geçmişi korunacak.
                      </p>
                    </div>
                  </>

                ) : modalMode === "transfer" ? (
                  <>
                    <div className="form-group">
                      <label>Hangi Danışmanı Taşıyacaksınız?</label>
                      <select className="combobox" onChange={e => setSelectedAdvisorTc(e.target.value)}>
                        <option value="">Seçiniz...</option>
                        {advisors.filter(a => a.managedFund === selectedFon?.code).map(a => (
                          <option key={a.tcNo} value={a.tcNo}>{a.fullName} (TC: {a.tcNo})</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Mevcut Fon</label>
                      <input type="text" className="modal-input" value={selectedFon?.name} disabled />
                    </div>
                    <div className="form-group">
                      <label>Geçiş Yapılacak Yeni Fon</label>
                      <select className="combobox" onChange={e => setTargetFundCode(e.target.value)}>
                        <option value="">Hedef Fonu Seçin...</option>
                        {funds.filter(f => f.code !== selectedFon?.code).map(f => (
                          <option key={f.code} value={f.code}>{f.name}</option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : modalMode === "bosalt" ? (
                  <>
                    <div className="form-group">
                      <label>Fondan Çıkarılacak Danışman</label>
                      <select className="combobox" onChange={e => setSelectedAdvisorTc(e.target.value)} value={selectedAdvisorTc}>
                        <option value="">Seçiniz...</option>
                        {advisors.filter(a => a.managedFund === selectedFon?.code).map(a => (
                          <option key={a.tcNo} value={a.tcNo}>{a.fullName} (TC: {a.tcNo})</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Mevcut Fon</label>
                      <input type="text" className="modal-input" value={selectedFon?.name} disabled />
                    </div>
                    {selectedAdvisorTc && (
                      <div style={{
                        padding: '10px 12px',
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: '6px',
                        color: '#ef4444',
                        fontSize: '12px',
                        marginTop: '8px'
                      }}>
                        ⚠ Bu işlem danışmanın <strong>{selectedFon?.code}</strong> fon atamasını kaldırır. Danışman boşta kalır.
                      </div>
                    )}
                  </>
                ) : modalMode === "yatirimci-cikar" ? (
                  <>
                    <h3 style={{ marginBottom: 16, color: '#e2e8f0' }}>Yatırımcıyı Fondan Çıkar</h3>

                    <div className="form-group">
                      <label>Yatırımcı Seçin</label>
                      <select
                        className="combobox"
                        value={selectedInvestorTc}
                        onChange={e => {
                          const tc = e.target.value;
                          setSelectedInvestorTc(tc);
                          // Yatırımcı değişince fonu sıfırla, ama eğer seçili fonda kaydı varsa onu seç
                          const inv = investors.find(i => i.tcNo === tc);
                          const hasCurrentFund = inv?.holdings?.some(h => h.fundCode === selectedFon?.code);
                          setInvestorFundCode(hasCurrentFund ? selectedFon?.code : '');
                        }}
                      >
                        <option value="">Seçiniz...</option>
                        {investors
                          .filter(inv => inv.holdings?.some(h => h.fundCode === selectedFon?.code))
                          .map(inv => (
                            <option key={inv.tcNo} value={inv.tcNo}>
                              {inv.fullName} (TC: {inv.tcNo})
                            </option>
                          ))
                        }
                      </select>
                    </div>

                    {selectedInvestorTc && (
                      <div className="form-group">
                        <label>Çıkarılacak Fon</label>
                        <select
                          className="combobox"
                          value={investorFundCode}
                          onChange={e => setInvestorFundCode(e.target.value)}
                        >
                          <option value="">Fon Seçin...</option>
                          {investors
                            .find(i => i.tcNo === selectedInvestorTc)
                            ?.holdings?.map(h => (
                              <option key={h.fundCode} value={h.fundCode}>
                                {h.fundCode} — {h.lots?.toLocaleString('tr-TR')} Lot
                              </option>
                            ))
                          }
                        </select>
                      </div>
                    )}

                    {selectedInvestorTc && investorFundCode && (
                      <div style={{
                        padding: '10px 12px',
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: '6px',
                        color: '#ef4444',
                        fontSize: '12px',
                        marginTop: '4px'
                      }}>
                        ⚠ Yatırımcı <strong>{investorFundCode}</strong> fonundan tamamen çıkarılacak. Bu işlem geri alınamaz.
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label>Hangi Fona Atanacak?</label>
                      <input type="text" className="modal-input" value={selectedFon?.name} disabled />
                    </div>
                    <div className="form-group">
                      <label>Atanacak Kişi (Admin veya Danışman)</label>
                      <select className="combobox" onChange={e => setSelectedAdvisorTc(e.target.value)}>
                        <option value="">Kişi Seçin...</option>
                        {advisors.map(a => (
                          <option key={a.tcNo} value={a.tcNo}>
                            {a.fullName} {a.role === 'ADMIN' ? '(YÖNETİCİ)' : '(DANIŞMAN)'} - {a.managedFund || 'Boşta'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div className="modal-actions">
                  <button
                    className={
                      modalMode === "sil-fon" || modalMode === "bosalt" || modalMode === "yatirimci-cikar"
                        ? "btn-delete-confirm"
                        : "btn-confirm"
                    }
                    onClick={handleConfirm}
                    disabled={
                      deleting ||
                      (modalMode === "bosalt" && !selectedAdvisorTc) ||
                      (modalMode === "yatirimci-cikar" && (!selectedInvestorTc || !investorFundCode))
                    }
                  >
                    {deleting
                      ? "Siliniyor..."
                      : modalMode === "sil-fon"
                      ? "Evet, Sil"
                      : modalMode === "bosalt" || modalMode === "yatirimci-cikar"
                      ? "Fondan Çıkar"
                      : "Onayla"}
                  </button>
                  <button className="btn-close" onClick={() => setShowModal(false)}>İptal</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Fon Detay Modalı — main dışında, tüm sayfanın üstünde */}
      {selectedDetailFon && (() => {
        const ALLOC_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];
        const fonDanismanlari = advisors.filter(a =>
          a.managedFund === selectedDetailFon.code
        );
        const allocData = (detailFund?.allocation || []).map(item => ({
          name: item.name,
          value: item.percentage ?? item.value ?? 0
        }));

        return (
          <div className="fon-detail-overlay" onClick={() => setSelectedDetailFon(null)}>
            <div className="fon-detail-modal" onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="fon-detail-header">
                <div>
                  <span className="fon-code-badge">{detailFund?.code || selectedDetailFon.code}</span>
                  <h2 className="fon-detail-title">{detailFund?.name || selectedDetailFon.name}</h2>
                  {detailFund?.type && <span className="fon-detail-type">{detailFund.type}</span>}
                </div>
                <button className="fon-detail-close" onClick={() => setSelectedDetailFon(null)}>✕</button>
              </div>

              {loadingDetail ? (
                <div className="fon-detail-loading">Yükleniyor...</div>
              ) : (
                <>
                  {/* ── 1. KURULUŞ BİLGİLERİ ── */}
                  <div className="fon-section">
                    <p className="fon-section-label">Kuruluş Bilgileri</p>
                    <div className="fon-founding-grid">
                      <div className="fon-founding-item">
                        <span className="fon-founding-key">Kuruluş Tarihi</span>
                        <span className="fon-founding-val">
                          {detailFund?.inceptionDate
                            ? new Date(detailFund.inceptionDate).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })
                            : '—'}
                        </span>
                      </div>
                      <div className="fon-founding-item">
                        <span className="fon-founding-key">Fon Türü</span>
                        <span className="fon-founding-val">{detailFund?.type || '—'}</span>
                      </div>
                      <div className="fon-founding-item">
                        <span className="fon-founding-key">Para Birimi</span>
                        <span className="fon-founding-val">{detailFund?.currency || 'TRY'}</span>
                      </div>
                      <div className="fon-founding-item">
                        <span className="fon-founding-key">Risk Seviyesi</span>
                        <span className="fon-founding-val">{detailFund?.riskLevel || '—'}</span>
                      </div>
                      <div className="fon-founding-item">
                        <span className="fon-founding-key">TEFAS Kapsamı</span>
                        <span className="fon-founding-val">
                          {detailFund?.tefas != null ? (detailFund.tefas ? 'Evet' : 'Hayır') : '—'}
                        </span>
                      </div>
                      {detailFund?.founder && (
                        <div className="fon-founding-item">
                          <span className="fon-founding-key">Kurucusu</span>
                          <span className="fon-founding-val">{detailFund.founder}</span>
                        </div>
                      )}
                    </div>
                    {(detailFund?.description || detailFund?.objective) && (
                      <div className="fon-description-box">
                        <span className="fon-founding-key" style={{ display: 'block', marginBottom: 6 }}>Kuruluş Amacı</span>
                        <p className="fon-description-text">{detailFund.description || detailFund.objective}</p>
                      </div>
                    )}
                  </div>

                  {/* ── 2. GÜNCEL DANIŞMANLAR ── */}
                  <div className="fon-section">
                    <p className="fon-section-label">Güncel Danışmanlar</p>
                    {fonDanismanlari.length > 0 ? (
                      <div className="fon-advisor-list">
                        {fonDanismanlari.map((a, i) => (
                          <div key={i} className="fon-advisor-card">
                            <div className="fon-advisor-avatar">
                              {(a.firstName || a.fullName || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="fon-advisor-name">
                                {a.firstName && a.lastName ? `${a.firstName} ${a.lastName}` : a.fullName || '—'}
                              </div>
                              <div className="fon-advisor-tc">TC: {a.tcNo}</div>
                            </div>
                            <span className={`fon-advisor-role ${a.role === 'ADMIN' ? 'admin' : 'advisor'}`}>
                              {a.role === 'ADMIN' ? 'Yönetici' : 'Danışman'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="fon-empty-state">Bu fona atanmış danışman bulunmuyor.</div>
                    )}
                  </div>

                  {/* ── 3. FON İSTATİSTİKLERİ ── */}
                  <div className="fon-section">
                    <p className="fon-section-label">Fon İstatistikleri</p>
                    <div className="fon-detail-stats">
                      <div className="fon-stat-card">
                        <span className="fon-stat-label">Birim Lot Değeri</span>
                        <span className="fon-stat-value">₺{detailFund?.price?.toLocaleString('tr-TR', { minimumFractionDigits: 4 }) ?? '—'}</span>
                      </div>
                      <div className="fon-stat-card">
                        <span className="fon-stat-label">Toplam Fon Değeri</span>
                        <span className="fon-stat-value fon-stat-small">₺{detailFund?.totalValue?.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) ?? '—'}</span>
                      </div>
                      <div className="fon-stat-card">
                        <span className="fon-stat-label">Toplam Lot</span>
                        <span className="fon-stat-value fon-stat-small">
                          {detailFund?.totalLot != null ? Number(detailFund.totalLot).toLocaleString('tr-TR') : '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── 4. GETİRİ PERFORMANSI ── */}
                  {detailFund?.performance && (
                    <div className="fon-section">
                      <p className="fon-section-label">Getiri Performansı</p>
                      <div className="fon-perf-grid">
                        {[
                          { label: 'Günlük', val: detailFund.performance.day1 },
                          { label: '1 Ay',   val: detailFund.performance.day30 },
                          { label: '3 Ay',   val: detailFund.performance.day90 },
                          { label: '6 Ay',   val: detailFund.performance.day180 },
                          { label: 'YBB',    val: detailFund.performance.ytd },
                          { label: '1 Yıl',  val: detailFund.performance.day365 },
                        ].map(({ label, val }) => (
                          <div key={label} className={`fon-perf-pill ${val == null ? 'neutral' : val >= 0 ? 'positive' : 'negative'}`}>
                            <span className="fon-perf-label">{label}</span>
                            <span className="fon-perf-val">
                              {val != null ? `${val >= 0 ? '+' : ''}${val.toFixed(2)}%` : '—'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── 5. SEKTÖREL AĞIRLIKLAR (PASta GRAFİĞİ) ── */}
                  {allocData.length > 0 && (
                    <div className="fon-section">
                      <p className="fon-section-label">Sektörel Ağırlıklar</p>
                      <div className="fon-alloc-pie-row">
                        <div style={{ width: 220, height: 220, flexShrink: 0 }}>
                          <ResponsiveContainer>
                            <PieChart>
                              <Pie
                                data={allocData}
                                cx="50%" cy="50%"
                                innerRadius={55}
                                outerRadius={90}
                                paddingAngle={2}
                                dataKey="value"
                              >
                                {allocData.map((_, i) => (
                                  <Cell key={i} fill={ALLOC_COLORS[i % ALLOC_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{ background: '#131722', border: '1px solid #2a2e39', borderRadius: 8, fontSize: 11, color: '#fff' }}
                                formatter={(v) => [`%${Number(v).toFixed(2)}`, '']}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="fon-alloc-legend">
                          {allocData.map((item, i) => (
                            <div key={i} className="fon-alloc-legend-row">
                              <span className="fon-alloc-legend-dot" style={{ background: ALLOC_COLORS[i % ALLOC_COLORS.length] }} />
                              <span className="fon-alloc-legend-name">{item.name}</span>
                              <div className="fon-alloc-bar-bg" style={{ flex: 1, margin: '0 10px' }}>
                                <div className="fon-alloc-bar-fill" style={{ width: `${item.value}%`, background: ALLOC_COLORS[i % ALLOC_COLORS.length] }} />
                              </div>
                              <span className="fon-alloc-pct">%{Number(item.value).toFixed(1)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── 6. MENKUL KIYMETler TABLOSU ── */}
                  {detailFund?.securities?.length > 0 && (
                    <div className="fon-section">
                      <p className="fon-section-label">Portföydeki Menkul Kıymetler</p>
                      <div style={{ overflowX: 'auto' }}>
                        <table className="fon-securities-table">
                          <thead>
                            <tr>
                              <th>Sembol</th>
                              <th>Ad</th>
                              <th>Tür</th>
                              <th>Ağırlık</th>
                              <th>Lot / Adet</th>
                              <th>Değer</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detailFund.securities.map((s, i) => (
                              <tr key={i}>
                                <td><span className="fon-code-badge">{s.symbol || s.ticker || '—'}</span></td>
                                <td style={{ color: '#d1d4dc' }}>{s.name || '—'}</td>
                                <td style={{ color: '#94a3b8' }}>{s.type || s.assetType || '—'}</td>
                                <td style={{ color: '#f59e0b', fontWeight: 700 }}>
                                  {s.weight != null ? `%${Number(s.weight).toFixed(2)}` : '—'}
                                </td>
                                <td style={{ color: '#d1d4dc' }}>
                                  {s.lotCount != null ? Number(s.lotCount).toLocaleString('tr-TR') : s.quantity != null ? Number(s.quantity).toLocaleString('tr-TR') : '—'}
                                </td>
                                <td style={{ color: '#10b981', fontWeight: 700 }}>
                                  {s.value != null ? `₺${Number(s.value).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* ── 7. FİYAT GEÇMİŞİ ── */}
                  <div className="fon-section">
                    <div className="fon-chart-header">
                      <p className="fon-section-label" style={{ margin: 0 }}>Fiyat Geçmişi</p>
                      <div className="fon-period-btns">
                        {DETAIL_PERIODS.map(p => (
                          <button
                            key={p.key}
                            className={`fon-period-btn ${detailPeriod === p.key ? 'active' : ''}`}
                            onClick={() => setDetailPeriod(p.key)}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {detailChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={detailChartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="detailGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35} />
                              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="priceDate" tickFormatter={v => v ? v.substring(0, 10) : ''} tick={{ fill: '#787b86', fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#787b86', fontSize: 10 }} axisLine={false} tickLine={false} width={55} tickFormatter={v => `₺${v.toLocaleString('tr-TR')}`} />
                          <Tooltip
                            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 6, fontSize: 11 }}
                            labelStyle={{ color: '#94a3b8' }}
                            itemStyle={{ color: '#818cf8' }}
                            formatter={v => [`₺${Number(v).toLocaleString('tr-TR', { minimumFractionDigits: 4 })}`, 'Fiyat']}
                            labelFormatter={v => v ? v.substring(0, 10) : v}
                          />
                          <Area type="monotone" dataKey="price" stroke="#4f46e5" strokeWidth={2} fill="url(#detailGrad)" dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="fon-no-chart">Bu dönem için fiyat verisi bulunamadı.</div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default YoneticiFon;

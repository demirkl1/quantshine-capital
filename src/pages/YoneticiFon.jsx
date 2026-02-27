import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import toast from 'react-hot-toast';
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

  const fetchInitialData = async () => {
    try {
      const [fundRes, advisorRes] = await Promise.all([
        api.get('/funds'),
        api.get('/users/advisors')
      ]);
      setFunds(fundRes.data);
      setAdvisors(advisorRes.data);
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

  const handleConfirm = () => {
    if (modalMode === "yeni-fon") return handleCreateFund();
    if (modalMode === "sil-fon") return handleDeleteFund();
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
                  <tr key={f.code}>
                    <td><span className="badge-fon-code">{f.code}</span></td>
                    <td><strong>{f.name}</strong></td>
                    <td>₺{f.price?.toLocaleString('tr-TR', { minimumFractionDigits: 4 })}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn-transfer-action" onClick={() => handleOpenModal("transfer", f)}>
                          Danışman İşlemleri
                        </button>
                        <button className="btn-delete-fund" onClick={() => handleOpenModal("sil-fon", f)}>
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
              {modalMode !== "yeni-fon" && modalMode !== "sil-fon" && (
                <div className="modal-tabs">
                  <button className={`modal-tab ${modalMode === "transfer" ? 'active' : ''}`} onClick={() => setModalMode("transfer")}>Transfer</button>
                  <button className={`modal-tab ${modalMode === "yeni-danisman" ? 'active' : ''}`} onClick={() => setModalMode("yeni-danisman")}>Yeni Kayıt</button>
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
                        {advisors.filter(a => a.managedFundCode === selectedFon?.code).map(a => (
                          <option key={a.id} value={a.tcNo}>{a.firstName} {a.lastName} (TC: {a.tcNo})</option>
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
                          <option key={a.id} value={a.tcNo}>
                            {a.firstName} {a.lastName} {a.role === 'ADMIN' ? '(YÖNETİCİ)' : '(DANIŞMAN)'} - {a.managedFundCode || 'Boşta'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div className="modal-actions">
                  <button
                    className={modalMode === "sil-fon" ? "btn-delete-confirm" : "btn-confirm"}
                    onClick={handleConfirm}
                    disabled={deleting}
                  >
                    {deleting ? "Siliniyor..." : modalMode === "sil-fon" ? "Evet, Sil" : "Onayla"}
                  </button>
                  <button className="btn-close" onClick={() => setShowModal(false)}>İptal</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default YoneticiFon;

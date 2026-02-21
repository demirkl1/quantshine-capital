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
    setShowModal(true);
  };

  const handleCreateFund = async () => {
    try {
      const data = { ...newFund, fundCode: newFund.fundCode.toUpperCase(), currentPrice: parseFloat(newFund.currentPrice) || 0 };
      await api.post('/funds', data);
      toast.success("Fon oluşturuldu!");
      setShowModal(false);
      fetchInitialData();
    } catch (err) { toast.error("Hata: Fon oluşturulamadı."); }
  };

  const handleTransferOrAssign = async () => {
    if (!selectedAdvisorTc) { toast.error("Lütfen bir danışman seçin!"); return; }
    
    const finalFundCode = modalMode === "transfer" ? targetFundCode : selectedFon.fundCode;
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
                  <tr key={f.id}>
                    <td><span className="badge-fon-code">{f.fundCode}</span></td>
                    <td><strong>{f.fundName}</strong></td>
                    <td>₺{f.currentPrice}</td>
                    
                    <td>
                      <button className="btn-transfer-action" onClick={() => handleOpenModal("transfer", f)}>
                        Danışman İşlemleri
                      </button>
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
              {modalMode !== "yeni-fon" && (
                <div className="modal-tabs">
                  <button className={`modal-tab ${modalMode === "transfer" ? 'active' : ''}`} onClick={() => setModalMode("transfer")}>Transfer</button>
                  <button className={`modal-tab ${modalMode === "yeni-danisman" ? 'active' : ''}`} onClick={() => setModalMode("yeni-danisman")}>Yeni Kayıt</button>
                </div>
              )}

              <div className="modal-body">
                {modalMode === "yeni-fon" ? (
                  <>
                    <div className="form-group">
                      <label>Fon Kodu (Örn: HSF)</label>
                      <input type="text" className="modal-input" onChange={e => setNewFund({...newFund, fundCode: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Fon Adı</label>
                      <input type="text" className="modal-input" onChange={e => setNewFund({...newFund, fundName: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Başlangıç Fiyatı</label>
                      <input type="number" className="modal-input" onChange={e => setNewFund({...newFund, currentPrice: e.target.value})} />
                    </div>
                  </>
                ) : modalMode === "transfer" ? (
                  <>
                    <div className="form-group">
                      <label>Hangi Danışmanı Taşıyacaksınız?</label>
                      <select className="combobox" onChange={e => setSelectedAdvisorTc(e.target.value)}>
                        <option value="">Seçiniz...</option>
                        {advisors.filter(a => a.managedFundCode === selectedFon?.fundCode).map(a => (
                          <option key={a.id} value={a.tcNo}>{a.firstName} {a.lastName} (TC: {a.tcNo})</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Mevcut Fon</label>
                      <input type="text" className="modal-input" value={selectedFon?.fundName} disabled />
                    </div>
                    <div className="form-group">
                      <label>Geçiş Yapılacak Yeni Fon</label>
                      <select className="combobox" onChange={e => setTargetFundCode(e.target.value)}>
                        <option value="">Hedef Fonu Seçin...</option>
                        {funds.filter(f => f.fundCode !== selectedFon?.fundCode).map(f => (
                          <option key={f.id} value={f.fundCode}>{f.fundName}</option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label>Hangi Fona Atanacak?</label>
                      <input type="text" className="modal-input" value={selectedFon?.fundName} disabled />
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
                  <button className="btn-confirm" onClick={modalMode === "yeni-fon" ? handleCreateFund : handleTransferOrAssign}>Onayla</button>
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
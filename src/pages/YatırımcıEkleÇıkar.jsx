import React, { useState, useEffect } from "react";
import api from '../api';
import toast from 'react-hot-toast';
import "./YatırımcıEkleÇıkar.css";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AdminSidebar from "../components/AdminSidebar";

const YatırımcıEkleÇıkar = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  // --- STATE TANIMLARI ---
  const [activeTab, setActiveTab] = useState("pending");
  const [istekler, setIstekler] = useState([]);
  const [myInvestors, setMyInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [otherAdvisors, setOtherAdvisors] = useState([]);
  const [transferSelections, setTransferSelections] = useState({});

  const [selectedInvestor, setSelectedInvestor] = useState(null);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const openWithdrawModal = (targetInvestor) => {
    setSelectedInvestor(targetInvestor);
    setIsWithdrawModalOpen(true);
  };
  const [depositAmount, setDepositAmount] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fundPrice, setFundPrice] = useState(1);

  // --- VERİ ÇEKME FONKSİYONLARI ---

  const fetchFundInfo = async () => {
    try {
      const response = await api.get(`/admin/fund-info?t=${new Date().getTime()}`);

      const rawPrice = response.data.currentPrice !== undefined ? response.data.currentPrice : response.data;
      setFundPrice(Number(rawPrice));
    } catch (err) {
      console.error("Fiyat çekilemedi:", err);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/pending');
      setIstekler(response.data);
    } catch (err) {
      console.error("Bekleyen kullanıcılar yüklenemedi:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOtherAdmins = async () => {
    if (!user) return;
    try {
      const response = await api.get('/admin/list-others');
      setOtherAdvisors(response.data);
    } catch (err) {
      console.error("Admin listesi çekilemedi:", err);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
    fetchFundInfo();
    if (user) {
      fetchMyInvestors();
      fetchOtherAdmins();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Sadece sayfa ilk açıldığında çalışır.

  const openInvestModal = (inv) => {
    setSelectedInvestor(inv);
    fetchFundInfo();
    setIsModalOpen(true);
  };

  const handleUpdateAssets = async (email, amount) => {
    if (!amount || amount <= 0) { toast.error("Lütfen geçerli bir miktar girin!"); return; }

    try {
      const response = await api.put('/admin/update-assets-by-email', null, {
        params: { email: email, depositAmount: amount }
      });

      toast.success("Bakiye başarıyla güncellendi!");

      // Modal'ı kapat ve verileri temizle
      setIsModalOpen(false);
      setDepositAmount("");
      fetchMyInvestors(); // Tablodaki rakamları anlık güncelle

    } catch (err) {
      console.error("Güncelleme Hatası:", err);
      toast.error("Hata: " + (err.response?.data || "Sunucu hatası"));
    }
  };

  const handleDecision = async (investorId, status) => {
    try {
      await api.put(`/admin/decision/${investorId}`, null, {
        params: { status: status }
      });
      status === 'ACCEPTED' ? toast.success("Onaylandı!") : toast.error("Reddedildi!");
      setIstekler(istekler.filter((i) => i.id !== investorId));
      fetchMyInvestors();
    } catch (err) {
      toast.error("İşlem başarısız!");
    }
  };
  const handleWithdraw = async (email, amount) => {
    if (!amount || amount <= 0) { toast.error("Lütfen miktar girin!"); return; }
    try {
      const response = await api.put('/admin/withdraw-assets-by-email', null, {
        params: { email: email, withdrawAmount: amount }
      });

      if (response.status === 200) {
        toast.success("İşlem başarılı!");
        setIsWithdrawModalOpen(false);
        fetchMyInvestors();
      }
    } catch (error) {
      toast.error("Hata: " + (error.response?.data?.error || error.response?.data?.message || "İşlem başarısız"));
    }
  };
  const fetchMyInvestors = async () => {
    try {
      const response = await api.get('/admin/my-investors');
      setMyInvestors(response.data);
    } catch (err) {
      console.error("Liste yüklenemedi:", err);
    }
  };
  const handleSelectChange = (investorId, value) => {
    setTransferSelections(prev => ({ ...prev, [investorId]: value }));
  };

  const handleTransfer = async (investorId) => {
    const targetAdminId = transferSelections[investorId];
    if (!targetAdminId) { toast.error("Lütfen transfer edilecek admini seçiniz!"); return; }

    try {
      await api.put(`/admin/transfer/${investorId}`, null, {
        params: { newAdminId: targetAdminId }
      });
      toast.success("Transfer başarılı!");
      // Listeyi güncelle (Transfer edilen yatırımcıyı listeden çıkar)
      setMyInvestors(myInvestors.filter(inv => inv.id !== investorId));
    } catch (err) {
      console.error("Transfer hatası:", err);
      toast.error("Transfer işlemi başarısız oldu.");
    }
  };

  const tabStyle = (tabName) => ({
    padding: '10px 20px',
    cursor: 'pointer',
    borderBottom: activeTab === tabName ? '3px solid #3b82f6' : 'none',
    color: activeTab === tabName ? '#3b82f6' : (isDark ? '#94a3b8' : '#64748b'),
    fontWeight: 'bold',
    background: 'transparent',
    border: 'none',
    fontSize: '1rem'
  });

  return (
    <div className={`admin-wrapper ${isDark ? "dark" : ""}`}>
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <main className={`admin-main ${isSidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}>
        <header className="admin-header">
          <div className="header-right">
            <button className="theme-toggle" onClick={toggleTheme}>
              {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
            <div className="user-profile">
              <div className="avatar-initials">
                {user?.name
                  ? user.name.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase()
                  : 'Q'}
              </div>
              <span>{user?.name}</span>
            </div>
          </div>
        </header>

        <div className="admin-content">
          <h1>👥 Yatırımcı Yönetimi</h1>

          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', borderBottom: '1px solid #334155' }}>
            <button style={tabStyle('pending')} onClick={() => setActiveTab('pending')}>
              ⏳ Onay Bekleyenler ({istekler.length})
            </button>
            <button style={tabStyle('my-investors')} onClick={() => setActiveTab('my-investors')}>
              💼 Yatırımcılarım
            </button>
          </div>

          {activeTab === 'pending' && (
            <table className="istek-table">
              <thead>
                <tr><th>Ad Soyad</th><th>Email</th><th>Talep Tarihi</th><th>İşlemler</th></tr>
              </thead>
              <tbody>
                {istekler.map((i) => (
                  <tr key={i.id}>
                    <td>{i.ad || i.firstName} {i.soyad || i.lastName}</td>
                    <td>{i.email}</td>
                    <td>{i.requestDate ? new Date(i.requestDate).toLocaleDateString() : "-"}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="accept-btn" onClick={() => handleDecision(i.id, 'ACCEPTED')}>✅</button>
                        <button className="reject-btn" onClick={() => handleDecision(i.id, 'REJECTED')}>❌</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'my-investors' && (
            <div style={{ backgroundColor: isDark ? '#1e293b' : 'white', padding: '20px', borderRadius: '10px' }}>
              <table className="istek-table">
                <thead>
                  <tr>
                    <th>Yatırımcı Adı</th>
                    <th>Email</th>
                    <th>Mevcut Lot</th>
                    <th>Toplam Varlık</th>
                    <th>Transfer Et</th>
                  </tr>
                </thead>
                <tbody>
                  {myInvestors.map((inv) => (
                    <tr key={inv.id}>
                      <td
                        style={{ fontWeight: 'bold', cursor: 'pointer', color: '#3b82f6' }}
                        onClick={() => openInvestModal(inv)}
                      >
                        {inv.ad} {inv.soyad}
                      </td>
                      <td>{inv.email}</td>
                      <td style={{ fontWeight: '600', color: '#10b981' }}>
                        {inv.lot ? inv.lot.toLocaleString(undefined, { minimumFractionDigits: 4 }) : '0.0000'}
                      </td>
                      <td>{(inv.suanDeger || 0).toLocaleString()} ₺</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <select
                            style={{
                              padding: '6px',
                              borderRadius: '6px',
                              border: '1px solid #334155',
                              backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                              color: isDark ? 'white' : '#1e293b',
                              fontSize: '0.85rem'
                            }}
                            value={transferSelections[inv.id] || ""}
                            onChange={(e) => handleSelectChange(inv.id, e.target.value)}
                          >
                            <option value="" disabled>Admin Seç</option>
                            {otherAdvisors.map(adv => (
                              <option key={adv.id} value={adv.id}>
                                {adv.ad} {adv.soyad}
                              </option>
                            ))}
                          </select>
                          <button
                            className="transfer-btn"
                            onClick={() => handleTransfer(inv.id)}
                            style={{ padding: '6px 10px' }}
                          >
                            ✈️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {isModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>💰 Varlık Tanımla</h3>
                  <button className="close-x" onClick={() => setIsModalOpen(false)}>×</button>
                </div>
                <div className="modal-body">
                  <p><strong>Yatırımcı:</strong> {selectedInvestor?.ad} {selectedInvestor?.soyad}</p>

                  <label>Yatırılan Tutar (₺):</label>
                  <input
                    type="number"
                    className="modal-input"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Örn: 50000"
                    autoFocus
                  />

                  {depositAmount > 0 && fundPrice > 0 && (
                    <div style={{
                      marginTop: '15px',
                      padding: '12px',
                      backgroundColor: isDark ? '#0f172a' : '#f0fdf4',
                      borderRadius: '8px',
                      border: '1px solid #22c55e'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '5px' }}>
                        <span>Güncel Fon Değeri:</span>
                        <strong>{Number(fundPrice).toFixed(2)} ₺</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', color: '#22c55e' }}>
                        <span>Tanımlanacak Lot:</span>
                        <strong>{(depositAmount / fundPrice).toFixed(4)}</strong>
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    onClick={() => handleUpdateAssets(selectedInvestor?.email, depositAmount)}
                    className="accept-btn"
                  >
                    Onayla ve Lot Tanımla
                  </button>
                  <button
                    className="btn-withdraw"
                    onClick={() => openWithdrawModal(selectedInvestor)}
                    style={{ backgroundColor: '#ef4444', color: 'white', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}
                  >
                    Para Çek
                  </button>
                  {isWithdrawModalOpen && (
                    <div className="modal-overlay">
                      <div className="modal-content">
                        <h3>📉 Para Çek: {selectedInvestor?.ad}</h3>
                        <input
                          type="number"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          placeholder="Çekilecek Tutar"
                        />
                        <button onClick={() => handleWithdraw(selectedInvestor.email, withdrawAmount)}>Onayla</button>
                        <button onClick={() => setIsWithdrawModalOpen(false)}>İptal</button>
                      </div>
                    </div>
                  )}
                  <button onClick={() => setIsModalOpen(false)} className="reject-btn">İptal</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default YatırımcıEkleÇıkar;
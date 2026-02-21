import React, { useState, useEffect } from 'react'; 
import api from '../api';
import { useAuth } from '../context/AuthContext'; 
import AdminSidebar from '../components/AdminSidebar';
import './Raporlama.css';
import { MdSend } from 'react-icons/md';
import toast from 'react-hot-toast';

const Raporlama = () => {
  const { token } = useAuth();
  const [investors, setInvestors] = useState([]); 
  const [selectedYatirimciId, setSelectedYatirimciId] = useState(""); 
  const [raporNotu, setRaporNotu] = useState("");
  const [title, setTitle] = useState("Haftalık Portföy Analizi");

  useEffect(() => {
    if (token) {
      api.get('/users/my-investors')
      .then(res => {
        const unpackedInvestors = res.data.map(item => ({
          id: item.investor.id,
          firstName: item.investor.firstName,
          lastName: item.investor.lastName,
          tcNo: item.investor.tcNo
        }));
        setInvestors(unpackedInvestors);
      })
      .catch(err => console.error("Yatırımcılar çekilemedi:", err));
    }
  }, [token]);

  const handleGonder = async (e) => {
    e.preventDefault();
    if (!selectedYatirimciId || !raporNotu) {
      toast.error("Lütfen yatırımcı seçin ve rapor içeriğini doldurun.");
      return;
    }

    try {
      await api.post('/reports/send', {
        investorId: parseInt(selectedYatirimciId, 10),
        title: title,
        content: raporNotu
      });

      toast.success("Rapor başarıyla iletildi!");
      setRaporNotu("");
      setSelectedYatirimciId("");
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.error
        || (typeof err.response?.data === 'string' ? err.response.data : null)
        || err.message
        || "İşlem başarısız";
      console.error("Rapor gönderme hatası:", err.response || err);
      toast.error("Hata: " + msg);
    }
  };

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <main className="admin-main">
        <header className="page-header">
          <h1>Raporlama ve Mesajlaşma</h1>
          <p>Yatırımcılara özel analiz raporlarını ve bilgilendirme notlarını buradan iletebilirsin.</p>
        </header>

        <div className="admin-content">
          <div className="report-form-container">
            <form className="report-form" onSubmit={handleGonder}>
              
              <div className="form-group">
                <label htmlFor="yatirimci-sec">Yatırımcı Seçiniz</label>
                <select
                  id="yatirimci-sec"
                  className="combobox"
                  value={selectedYatirimciId}
                  onChange={(e) => setSelectedYatirimciId(e.target.value)}
                  required
                >
                  <option value="">Rapor gönderilecek yatırımcıyı seçin...</option>
                  {investors.map(y => (
                    <option key={y.id} value={y.id}>
                      {y.firstName} {y.lastName} ({y.tcNo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="rapor-text">Rapor İçeriği / Mesaj</label>
                <textarea 
                  id="rapor-text"
                  className="report-textarea"
                  placeholder="Yatırımcıya iletilecek rapor detaylarını buraya yazınız..."
                  value={raporNotu}
                  onChange={(e) => setRaporNotu(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-send-report">
                <MdSend className="send-icon" /> Raporu Gönder
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Raporlama;
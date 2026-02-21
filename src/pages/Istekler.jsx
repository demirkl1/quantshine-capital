import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Istekler.css';

const Istekler = () => {
  const { token } = useAuth();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchPendingUsers();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/pending');
      setPendingRequests(res.data);
    } catch (err) {
      console.error("API Hatası:", err.response?.status);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    if (action === 'approve') {
      try {
        await api.post(`/users/${id}/approve`, {});
        toast.success("Kullanıcı başarıyla onaylandı!");
        setPendingRequests(pendingRequests.filter(user => user.id !== id));
      } catch (err) {
        toast.error("Onaylama hatası: " + (err.response?.data || "Bilinmeyen hata"));
      }
    } else if (action === 'reject') {
      const confirmDelete = window.confirm("Bu isteği reddetmek ve kullanıcıyı sistemden tamamen silmek istediğinize emin misiniz?");
      if (!confirmDelete) return;

      try {
        await api.delete(`/users/${id}/reject`);
        toast.success("İstek reddedildi ve kullanıcı silindi.");
        setPendingRequests(pendingRequests.filter(user => user.id !== id));
      } catch (err) {
        toast.error("Reddetme hatası: " + (err.response?.data || "Bilinmeyen hata"));
      }
    }
  };

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <main className="admin-main">
        <header className="page-header">
          <h1>Kayıt İstekleri</h1>
        </header>
        <div className="admin-content">
          <div className="table-container">
            {loading ? (
              <div className="no-data-msg">Veriler yükleniyor, lütfen bekle...</div>
            ) : (
              <>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>TC No</th>
                      <th>Ad Soyad</th>
                      <th>E-Posta</th>
                      <th>Rol</th>
                      <th style={{ textAlign: 'center' }}>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRequests.map((request) => (
                      <tr key={request.id}>
                        <td>{request.tcNo}</td>
                        <td>{request.firstName} {request.lastName}</td>
                        <td>{request.email}</td>
                        <td>{request.role}</td>
                        <td className="actions-cell" style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                          <button className="btn-approve" onClick={() => handleAction(request.id, 'approve')}>
                            Kabul Et
                          </button>
                          <button
                            className="btn-reject" 
                            onClick={() => handleAction(request.id, 'reject')}
                            style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 15px', cursor: 'pointer' }}
                          >
                            Reddet
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {pendingRequests.length === 0 && <div className="no-data-msg">Bekleyen istek yok.</div>}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Istekler;
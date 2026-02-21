import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import { MdEdit, MdSave, MdCancel, MdEmail, MdBadge, MdBusinessCenter } from 'react-icons/md';
import toast from 'react-hot-toast';
import './Profil.css';

const Profil = () => {
  const { token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    tcNo: '',
    role: '',
    managedFundCode: '',
    description: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/me');
        setUser(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Profil yüklenemedi:", err);
        setLoading(false);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  const handleSave = async () => {
    try {
      await api.put('/users/update-description', { description: user.description });
      setIsEditing(false);
      toast.success("Profil açıklaması güncellendi.");
    } catch (err) {
      toast.error("Hata: Açıklama güncellenemedi.");
    }
  };

  if (loading) return <div className="loading">Yükleniyor...</div>;

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <main className="admin-main">
        <header className="page-header">
          <h1>Profil Bilgilerim</h1>
          <p>Kişisel bilgilerinizi ve sistemdeki aktif rollerinizi buradan yönetebilirsiniz.</p>
        </header>

        <div className="admin-content">
          <div className="profile-card">
            {/* Profil Üst Kısım */}
            <div className="profile-header">
              <div className="profile-avatar">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
              <div className="profile-title">
                <h2>{user.firstName} {user.lastName}</h2>
                <span className="role-badge">{user.role === 'ADMIN' ? 'Sistem Yöneticisi' : 'Portföy Danışmanı'}</span>
              </div>
            </div>

            <div className="profile-details-grid">
              {/* E-Posta */}
              <div className="detail-item">
                <label><MdEmail /> E-Posta Adresi</label>
                <p>{user.email}</p>
              </div>

              {/* TC Kimlik */}
              <div className="detail-item">
                <label><MdBadge /> TC Kimlik No</label>
                <p>{user.tcNo || "Belirtilmemiş"}</p>
              </div>

              {/* Sorumlu Olduğu Fon */}
              <div className="detail-item">
                <label><MdBusinessCenter /> Sorumlu Olduğunuz Fon</label>
                <div className="profile-badges">
                   {user.managedFundCode ? (
                     <span className="badge-fon-profile">{user.managedFundCode}</span>
                   ) : (
                     <span className="badge-fon-profile">Genel Yönetim</span>
                   )}
                </div>
              </div>

              {/* Açıklama Alanı (Sadece Burası Düzenlenebilir) */}
              <div className="detail-item full-width">
                <div className="description-header">
                  <label>Hakkımda / Profil Açıklaması</label>
                  {!isEditing ? (
                    <button className="btn-edit-inline" onClick={() => setIsEditing(true)}>
                      <MdEdit /> Düzenle
                    </button>
                  ) : (
                    <div className="edit-actions">
                      <button className="btn-save-inline" onClick={handleSave}><MdSave /> Kaydet</button>
                      <button className="btn-cancel-inline" onClick={() => setIsEditing(false)}><MdCancel /> İptal</button>
                    </div>
                  )}
                </div>
                <textarea
                  className={`profile-textarea ${isEditing ? 'editing' : ''}`}
                  value={user.description || ""}
                  onChange={(e) => setUser({...user, description: e.target.value})}
                  readOnly={!isEditing}
                  placeholder="Yatırımcılarınızın sizi tanıması için kendinizden bahsedin..."
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profil;
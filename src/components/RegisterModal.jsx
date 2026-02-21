import React, { useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import './RegisterModal.css';

const RegisterModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    tcNo: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'INVESTOR' // Varsayılan rol eklendi
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Telefon numarasındaki boşluk, tire vb. karakterleri temizle
    const payload = {
      ...formData,
      phoneNumber: formData.phoneNumber.replace(/\D/g, '') || null,
    };

    try {
      const response = await api.post('/auth/pending/register', payload);

      toast.success('Kayıt isteğiniz gönderildi. Admin onayı bekleniyor.');
      onClose();
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || error.response?.data || "Sunucuya ulaşılamıyor.";
      toast.error('Kayıt başarısız: ' + message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <h2 className="modal-title">QuantShine Capital - Hesap Oluştur</h2>

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="firstName">Adınız</label>
            <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Soyadınız</label>
            <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
          </div>

          {/* ROL SEÇİMİ BURAYA EKLENDİ */}
          <div className="form-group">
            <label htmlFor="role">Kayıt Türü</label>
            <select id="role" name="role" value={formData.role} onChange={handleChange} required>
                <option value="INVESTOR">Yatırımcı</option>
                <option value="ADVISOR">Danışman</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="tcNo">TC Kimlik Numarası</label>
            <input type="text" id="tcNo" name="tcNo" maxLength="11" value={formData.tcNo} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Telefon Numarası</label>
            <input type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="email">E-posta Adresi</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="password">Şifre</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>

          <button type="submit" className="btn primary register-btn">Kaydol</button>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal;
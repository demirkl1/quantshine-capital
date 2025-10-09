// src/components/RegisterModal.jsx

import React, { useState } from 'react';
import axios from 'axios'; // axios kütüphanesini import edin
import './RegisterModal.css';

const RegisterModal = ({ isOpen, onClose }) => {
  // Form verilerini tutmak için state oluşturun
  const [formData, setFormData] = useState({
    ad: '',
    soyad: '',
    dogumTarihi: '',
    email: '',
    sifre: ''
  });

  if (!isOpen) return null;

  // Her input alanındaki değişikliği yakalayıp state'i güncelleyin
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      // name="ad" ise formData.ad güncellenir
      // name="soyad" ise formData.soyad güncellenir
      [name]: value
    });
  };

  // Form gönderildiğinde backend'e API çağrısı yapın
  const handleSubmit = async (e) => {
    e.preventDefault(); // Sayfanın yenilenmesini engelleyin

    try {
      // Axios ile POST isteği gönderin
      const response = await axios.post('http://localhost:8081/api/auth/register', formData);
      
      // Başarılı olursa kullanıcıya bildirim gösterin
      alert(response.data);
      console.log('Kayıt başarılı:', response.data);

      // Modalı kapatın
      onClose();

    } catch (error) {
      // Hata olursa kullanıcıya bildirim gösterin
      console.error('Kayıt hatası:', error.response ? error.response.data : error.message);
      alert('Kayıt işlemi başarısız: ' + (error.response ? error.response.data : 'Sunucuya ulaşılamıyor.'));
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <h2 className="modal-title">Hesap Oluştur</h2>
        
        {/* onSubmit event'ine handleSubmit fonksiyonunu bağlayın */}
        <form className="register-form" onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label htmlFor="ad">Adınız</label>
            {/* name ve value attribute'larını state ile eşleştirin */}
            <input type="text" id="ad" name="ad" value={formData.ad} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="soyad">Soyadınız</label>
            <input type="text" id="soyad" name="soyad" value={formData.soyad} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="dogumTarihi">Doğum Tarihi</label>
            <input type="date" id="dogumTarihi" name="dogumTarihi" value={formData.dogumTarihi} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">E-posta Adresi</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="sifre">Şifre</label>
            <input type="password" id="sifre" name="sifre" value={formData.sifre} onChange={handleChange} required />
          </div>
          
          <button type="submit" className="btn primary register-btn">Kaydol</button>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal;
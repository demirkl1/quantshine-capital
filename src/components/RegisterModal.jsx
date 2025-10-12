import React, { useState } from 'react';
import axios from 'axios';
import './RegisterModal.css';
import DatePickerField from './DatePickerField'; // yeni bileşen

const RegisterModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    ad: '',
    soyad: '',
    dogumTarihi: null,
    email: '',
    sifre: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, dogumTarihi: date });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedData = {
        ...formData,
        dogumTarihi: formData.dogumTarihi
          ? formData.dogumTarihi.toISOString().split('T')[0]
          : null
      };

      const response = await axios.post('http://localhost:8081/api/auth/register', formattedData);
      alert(response.data);
      onClose();
    } catch (error) {
      alert('Kayıt işlemi başarısız: ' + (error.response ? error.response.data : 'Sunucuya ulaşılamıyor.'));
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <h2 className="modal-title">Hesap Oluştur</h2>

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="ad">Adınız</label>
            <input type="text" id="ad" name="ad" value={formData.ad} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="soyad">Soyadınız</label>
            <input type="text" id="soyad" name="soyad" value={formData.soyad} onChange={handleChange} required />
          </div>

          {/* DatePickerField kullanımı */}
          <div className="form-group">
            <label htmlFor="dogumTarihi">Doğum Tarihi</label>
            <DatePickerField
              id="dogumTarihi"
              selected={formData.dogumTarihi}
              onChange={handleDateChange}
              placeholder="Gün / Ay / Yıl"
            />
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

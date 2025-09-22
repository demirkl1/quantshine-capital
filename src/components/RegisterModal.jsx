// src/components/RegisterModal.jsx
import React from 'react';
import './RegisterModal.css';

const RegisterModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <h2 className="modal-title">Hesap Oluştur</h2>
        <form className="register-form">
          <div className="form-group">
            <label htmlFor="firstName">Adınız</label>
            <input type="text" id="firstName" name="firstName" required />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Soyadınız</label>
            <input type="text" id="lastName" name="lastName" required />
          </div>
          <div className="form-group">
            <label htmlFor="birthDate">Doğum Tarihi</label>
            <input type="date" id="birthDate" name="birthDate" required />
          </div>
          <div className="form-group">
            <label htmlFor="email">E-posta Adresi</label>
            <input type="email" id="email" name="email" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Şifre</label>
            <input type="password" id="password" name="password" required />
          </div>
          <button type="submit" className="btn primary register-btn">Kaydol</button>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal;
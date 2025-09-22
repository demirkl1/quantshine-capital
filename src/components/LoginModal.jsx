// src/components/LoginModal.jsx
import React from 'react';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <h2 className="modal-title">Giriş Yap</h2>
        <form className="login-form">
          <div className="form-group">
            <label htmlFor="email">E-posta</label>
            <input type="email" id="email" name="email" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Şifre</label>
            <input type="password" id="password" name="password" required />
          </div>
          <button type="submit" className="btn primary login-btn">Giriş Yap</button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
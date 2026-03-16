import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    // Temel format doğrulama
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage('Geçerli bir e-posta adresi giriniz.');
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setErrorMessage('Şifre en az 6 karakter olmalıdır.');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/auth/login', {
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      });

      login(res.data);

      const roles = jwtDecode(res.data.access_token).realm_access?.roles || [];
      setTimeout(() => {
        onClose();
        if (roles.includes('ADMIN')) {
          navigate('/admin-anasayfa');
        } else if (roles.includes('ADVISOR')) {
          navigate('/danisman-anasayfa');
        } else {
          navigate('/yatirimci-anasayfa');
        }
      }, 300);
    } catch (err) {
      const status = err.response?.status;
      // API hata ayrıntılarını kullanıcıya gösterme — genel mesaj yeterli
      if (status === 401 || status === 403) {
        setErrorMessage('E-posta veya şifre hatalı.');
      } else if (status === 429) {
        setErrorMessage('Çok fazla deneme yapıldı. Lütfen bir süre bekleyin.');
      } else {
        setErrorMessage('Giriş yapılamıyor. Lütfen tekrar deneyin.');
      }
      // Şifre alanını temizle
      setFormData((prev) => ({ ...prev, password: '' }));
    } finally {
      setLoading(false);
    }
  };

  // Overlay tıklamasıyla modal kapatma
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="login-title">
        <button className="modal-close-btn" onClick={onClose} aria-label="Kapat">&times;</button>
        <h2 className="modal-title" id="login-title">Giriş Yap</h2>

        {errorMessage && (
          <div className="message-box error" role="alert">{errorMessage}</div>
        )}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">E-posta</label>
            <input
              type="email" id="email" name="email"
              value={formData.email} onChange={handleChange}
              required autoComplete="email"
              placeholder="ornek@quantshine.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Şifre</label>
            <input
              type="password" id="password" name="password"
              value={formData.password} onChange={handleChange}
              required autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn primary login-btn" disabled={loading}>
            {loading ? 'Kontrol Ediliyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;

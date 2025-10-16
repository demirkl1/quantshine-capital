import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    sifre: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setErrorMessage('');

    try {
      const response = await axios.post(
        'http://localhost:8081/api/auth/login',
        formData,
        { headers: { 'Content-Type': 'application/json' } }
      );

      const data = response.data;
      console.log('✅ Backend response:', data);

      // Kullanıcının onay durumu kontrolü
      if (data.status === 'pending') {
        setErrorMessage('İsteğiniz bekleniyor. Danışman onayı tamamlandığında giriş yapabilirsiniz.');
        return;
      } else if (data.status === 'rejected') {
        setErrorMessage('Hesap bulunmamaktadır veya reddedildi.');
        return;
      }

      // Onaylı kullanıcıyı AuthContext'e kaydet
      login(data);

      // Token varsa kaydet
      if (data.token && data.token.trim() !== '') {
        localStorage.setItem('token', data.token);
      } else {
        console.warn('⚠️ Token boş geldi, oturum yerel olarak kaydedilmeyecek.');
        localStorage.removeItem('token');
      }

      setMessage('✅ Giriş başarılı! Yönlendiriliyorsunuz...');

      setTimeout(() => {
        onClose();

        // Admin kontrolü
        if (data.isAdmin === true || data.isAdmin === 'true') {
          navigate('/admin-anasayfa');
        } else {
          navigate('/portfoyum');
        }

      }, 1200);

    } catch (error) {
      console.error('❌ Login hatası:', error);

      if (error.response) {
        const backendMessage = error.response.data?.message || 'Giriş bilgileri hatalı.';
        setErrorMessage(`Hata: ${backendMessage}`);
      } else if (error.request) {
        setErrorMessage('Sunucuya ulaşılamıyor. Lütfen backend\'in çalıştığından emin olun.');
      } else {
        setErrorMessage('Beklenmeyen bir hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <h2 className="modal-title">Giriş Yap</h2>

        {message && <div className="message-box success">{message}</div>}
        {errorMessage && <div className="message-box error">{errorMessage}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">E-posta</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="sifre">Şifre</label>
            <input
              type="password"
              id="sifre"
              name="sifre"
              value={formData.sifre}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn primary login-btn" disabled={loading}>
            {loading ? 'Yükleniyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;

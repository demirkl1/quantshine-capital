import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    try {
        const res = await api.post('/auth/login', formData);
        
        // 1. Context Login çağır (LocalStorage'a yazar ve state'i günceller)
        login(res.data); 

        // 2. Rol kontrolü ve yönlendirme
        const roles = jwtDecode(res.data.access_token).realm_access?.roles || [];
        
        setTimeout(() => {
            onClose();
            if (roles.includes('ADMIN')) {
                navigate('/admin-anasayfa'); // Veya istediğin admin sayfası
            } else if (roles.includes('ADVISOR')) {
                navigate('/danisman-anasayfa'); // Demir artık buraya gidecek!
            } else {
                navigate('/yatirimci-anasayfa'); // Sadece investor olanlar buraya
            }
        }, 500);
    } catch (err) {
        setErrorMessage("Giriş bilgileri hatalı.");
    } finally { setLoading(false); }
};

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <h2 className="modal-title">QuantShine Capital'e Giriş Yap</h2>

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
              placeholder="örnek@quantshine.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Şifre</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn primary login-btn" disabled={loading}>
            {loading ? 'Sistem Kontrol Ediliyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
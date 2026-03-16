import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './DesktopAuthPage.css';

/* ─── Giriş Formu ─────────────────────────────────────── */
const LoginForm = ({ onSwitchToRegister }) => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    setError('');
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', formData);
      login(res.data);
      const roles = jwtDecode(res.data.access_token).realm_access?.roles || [];
      setTimeout(() => {
        if (roles.includes('ADMIN'))        navigate('/admin-anasayfa');
        else if (roles.includes('ADVISOR')) navigate('/danisman-anasayfa');
        else                                navigate('/yatirimci-anasayfa');
      }, 400);
    } catch {
      setError('E-posta veya şifre hatalı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dap-form-card">
      <div className="dap-form-header">
        <h2 className="dap-form-title">Hoş Geldiniz</h2>
        <p className="dap-form-sub">Hesabınıza giriş yapın</p>
      </div>

      {error && (
        <div className="dap-alert dap-alert-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}

      <form className="dap-form" onSubmit={handleSubmit}>
        <div className="dap-field">
          <label>E-posta</label>
          <div className="dap-input-wrap">
            <svg className="dap-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <input
              type="email"
              name="email"
              placeholder="ornek@quantshine.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div className="dap-field">
          <label>Şifre</label>
          <div className="dap-input-wrap">
            <svg className="dap-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <input
              type={showPass ? 'text' : 'password'}
              name="password"
              placeholder="Şifrenizi girin"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
            <button type="button" className="dap-eye-btn" onClick={() => setShowPass((p) => !p)} tabIndex={-1}>
              {showPass
                ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              }
            </button>
          </div>
        </div>

        <button type="submit" className="dap-submit-btn" disabled={loading}>
          {loading ? (
            <><span className="dap-spinner" /> Giriş Yapılıyor...</>
          ) : (
            'Giriş Yap'
          )}
        </button>
      </form>

      <p className="dap-switch-text">
        Hesabınız yok mu?{' '}
        <button className="dap-switch-link" onClick={onSwitchToRegister}>
          Kayıt Olun
        </button>
      </p>
    </div>
  );
};

/* ─── Kayıt Formu ─────────────────────────────────────── */
const RegisterForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    tcNo: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'INVESTOR',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = { ...formData, phoneNumber: formData.phoneNumber.replace(/\D/g, '') || null };
    try {
      await api.post('/auth/pending/register', payload);
      toast.success('Kayıt isteğiniz gönderildi. Admin onayı bekleniyor.');
      onSwitchToLogin();
    } catch (err) {
      const status = err.response?.status;
      const msg = status === 409
        ? 'Bu e-posta veya TC No zaten kayıtlı.'
        : status === 400
        ? 'Girdiğiniz bilgileri kontrol edin.'
        : 'Kayıt işlemi şu an gerçekleştirilemiyor. Lütfen tekrar deneyin.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dap-form-card dap-form-card--register">
      <div className="dap-form-header">
        <h2 className="dap-form-title">Hesap Oluştur</h2>
        <p className="dap-form-sub">Bilgilerinizi eksiksiz doldurun</p>
      </div>

      <form className="dap-form" onSubmit={handleSubmit}>
        <div className="dap-field-row">
          <div className="dap-field">
            <label>Ad</label>
            <div className="dap-input-wrap">
              <svg className="dap-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <input type="text" name="firstName" placeholder="Adınız" value={formData.firstName} onChange={handleChange} required />
            </div>
          </div>
          <div className="dap-field">
            <label>Soyad</label>
            <div className="dap-input-wrap">
              <svg className="dap-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <input type="text" name="lastName" placeholder="Soyadınız" value={formData.lastName} onChange={handleChange} required />
            </div>
          </div>
        </div>

        <div className="dap-field">
          <label>Kayıt Türü</label>
          <div className="dap-input-wrap dap-select-wrap">
            <svg className="dap-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <select name="role" value={formData.role} onChange={handleChange} required>
              <option value="INVESTOR">Yatırımcı</option>
              <option value="ADVISOR">Danışman</option>
            </select>
          </div>
        </div>

        <div className="dap-field">
          <label>TC Kimlik No</label>
          <div className="dap-input-wrap">
            <svg className="dap-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            <input type="text" name="tcNo" placeholder="11 haneli TC kimlik" maxLength="11" value={formData.tcNo} onChange={handleChange} required />
          </div>
        </div>

        <div className="dap-field">
          <label>Telefon</label>
          <div className="dap-input-wrap">
            <svg className="dap-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l1.69-1.69a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <input type="tel" name="phoneNumber" placeholder="0555 123 45 67" value={formData.phoneNumber} onChange={handleChange} required />
          </div>
        </div>

        <div className="dap-field">
          <label>E-posta</label>
          <div className="dap-input-wrap">
            <svg className="dap-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <input type="email" name="email" placeholder="ornek@quantshine.com" value={formData.email} onChange={handleChange} required autoComplete="email" />
          </div>
        </div>

        <div className="dap-field">
          <label>Şifre</label>
          <div className="dap-input-wrap">
            <svg className="dap-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <input type="password" name="password" placeholder="Şifrenizi oluşturun" value={formData.password} onChange={handleChange} required autoComplete="new-password" />
          </div>
        </div>

        <button type="submit" className="dap-submit-btn" disabled={loading}>
          {loading ? (
            <><span className="dap-spinner" /> Gönderiliyor...</>
          ) : (
            'Kayıt Ol'
          )}
        </button>
      </form>

      <p className="dap-switch-text">
        Zaten hesabınız var mı?{' '}
        <button className="dap-switch-link" onClick={onSwitchToLogin}>
          Giriş Yapın
        </button>
      </p>
    </div>
  );
};

/* ─── Ana Sayfa ───────────────────────────────────────── */
const DesktopAuthPage = () => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'

  return (
    <div className="dap-root">
      {/* Arka plan efektleri */}
      <div className="dap-bg-grid" />
      <div className="dap-orb dap-orb-1" />
      <div className="dap-orb dap-orb-2" />
      <div className="dap-orb dap-orb-3" />

      {/* Sol panel — marka */}
      <div className="dap-brand-panel">
        <div className="dap-brand-content">
          <div className="dap-brand-logo-wrap">
            <img src="/quantshine_capital.png" alt="Logo" className="dap-brand-logo" />
          </div>

          <div className="dap-brand-text">
            <h1 className="dap-brand-name">
              <span className="dap-brand-quant">QUANT</span>
              <span className="dap-brand-shine">SHINE</span>
            </h1>
            <p className="dap-brand-capital">C A P I T A L</p>
          </div>

          <div className="dap-brand-divider">
            <span className="dap-brand-line" />
            <span className="dap-brand-dot" />
            <span className="dap-brand-line" />
          </div>

          <p className="dap-brand-slogan">
            Akıllı yatırım kararları için<br />
            <strong>profesyonel portföy yönetimi</strong>
          </p>

          <div className="dap-brand-features">
            <div className="dap-feature">
              <span className="dap-feature-icon">◈</span>
              <span>Gerçek zamanlı portföy takibi</span>
            </div>
            <div className="dap-feature">
              <span className="dap-feature-icon">◈</span>
              <span>Uzman danışman desteği</span>
            </div>
            <div className="dap-feature">
              <span className="dap-feature-icon">◈</span>
              <span>Güvenli ve şeffaf işlem geçmişi</span>
            </div>
          </div>
        </div>

        <div className="dap-brand-footer">
          <p>© 2025 Quantshine Capital. Tüm hakları saklıdır.</p>
        </div>
      </div>

      {/* Sağ panel — form */}
      <div className="dap-form-panel">
        {/* Sekme seçici */}
        <div className="dap-tabs">
          <button
            className={`dap-tab ${activeTab === 'login' ? 'dap-tab--active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Giriş Yap
          </button>
          <button
            className={`dap-tab ${activeTab === 'register' ? 'dap-tab--active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            Kayıt Ol
          </button>
        </div>

        {/* Form alanı */}
        <div className="dap-form-area">
          {activeTab === 'login'
            ? <LoginForm onSwitchToRegister={() => setActiveTab('register')} />
            : <RegisterForm onSwitchToLogin={() => setActiveTab('login')} />
          }
        </div>
      </div>
    </div>
  );
};

export default DesktopAuthPage;

import React, { useState } from 'react';
import api from '../api';
import './LoginModal.css';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'email' | 'code' | 'password';

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  if (!isOpen) return null;

  const reset = () => {
    setStep('email'); setEmail(''); setCode(''); setNewPassword(''); setConfirm('');
    setError(''); setInfo(''); setLoading(false);
  };
  const close = () => { reset(); onClose(); };

  // Adım 1 — e-posta gönder
  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setError('Geçerli bir e-posta adresi giriniz.'); return; }
    setLoading(true);
    try {
      await api.post('/auth/password/forgot', { email: email.toLowerCase().trim() });
      setInfo('E-posta adresiniz kayıtlıysa 6 haneli doğrulama kodu gönderildi.');
      setStep('code');
    } catch {
      setError('İşlem şu an gerçekleştirilemiyor. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Adım 2 — kodu doğrula
  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^\d{6}$/.test(code)) { setError('Kod 6 haneli olmalıdır.'); return; }
    setLoading(true);
    try {
      await api.post('/auth/password/verify', { email: email.toLowerCase().trim(), code });
      setInfo('');
      setStep('password');
    } catch {
      setError('Doğrulama kodu geçersiz veya süresi dolmuş.');
    } finally {
      setLoading(false);
    }
  };

  // Adım 3 — yeni şifre
  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 8) { setError('Şifre en az 8 karakter olmalıdır.'); return; }
    if (newPassword !== confirm) { setError('Şifreler eşleşmiyor.'); return; }
    setLoading(true);
    try {
      await api.post('/auth/password/reset', { email: email.toLowerCase().trim(), code, newPassword });
      setError(''); setInfo('Şifreniz güncellendi. Yeni şifrenizle giriş yapabilirsiniz.');
      setTimeout(close, 1800);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status;
      setError(status === 400
        ? 'Şifre güncellenemedi. Kod geçersiz olabilir veya şifre kurallara uymuyor.'
        : 'İşlem şu an gerçekleştirilemiyor. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const overlayClick = (e: React.MouseEvent) => { if (e.target === e.currentTarget) close(); };

  return (
    <div className="modal-overlay" onClick={overlayClick}>
      <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="forgot-title">
        <button className="modal-close-btn" onClick={close} aria-label="Kapat">&times;</button>
        <h2 className="modal-title" id="forgot-title">Şifremi Unuttum</h2>

        {error && <div className="message-box error" role="alert">{error}</div>}
        {info && <div className="message-box" role="status" style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', padding: '10px 12px', borderRadius: 8, marginBottom: 12, fontSize: '0.9rem' }}>{info}</div>}

        {step === 'email' && (
          <form className="login-form" onSubmit={submitEmail} noValidate>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 12 }}>
              Hesabınızın e-posta adresini girin; doğrulama kodu göndereceğiz.
            </p>
            <div className="form-group">
              <label htmlFor="fp-email">E-posta</label>
              <input id="fp-email" type="email" value={email} autoComplete="email"
                onChange={(e) => setEmail(e.target.value)} placeholder="ornek@quantshine.com" required />
            </div>
            <button type="submit" className="btn primary login-btn" disabled={loading}>
              {loading ? 'Gönderiliyor...' : 'Kod Gönder'}
            </button>
          </form>
        )}

        {step === 'code' && (
          <form className="login-form" onSubmit={submitCode} noValidate>
            <div className="form-group">
              <label htmlFor="fp-code">Doğrulama Kodu</label>
              <input id="fp-code" type="text" inputMode="numeric" maxLength={6} value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} placeholder="6 haneli kod" required />
            </div>
            <button type="submit" className="btn primary login-btn" disabled={loading}>
              {loading ? 'Kontrol ediliyor...' : 'Kodu Doğrula'}
            </button>
            <button type="button" className="btn" style={{ marginTop: 8, background: 'transparent', color: '#94a3b8' }}
              onClick={() => { setError(''); setStep('email'); }}>
              ← E-postayı değiştir
            </button>
          </form>
        )}

        {step === 'password' && (
          <form className="login-form" onSubmit={submitPassword} noValidate>
            <div className="form-group">
              <label htmlFor="fp-new">Yeni Şifre</label>
              <input id="fp-new" type="password" value={newPassword} autoComplete="new-password"
                onChange={(e) => setNewPassword(e.target.value)} placeholder="En az 8 karakter" required />
            </div>
            <div className="form-group">
              <label htmlFor="fp-confirm">Yeni Şifre (Tekrar)</label>
              <input id="fp-confirm" type="password" value={confirm} autoComplete="new-password"
                onChange={(e) => setConfirm(e.target.value)} placeholder="Yeni şifreyi tekrar girin" required />
            </div>
            <button type="submit" className="btn primary login-btn" disabled={loading}>
              {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;

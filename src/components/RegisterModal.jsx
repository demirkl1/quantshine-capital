import React, { useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import './RegisterModal.css';

// ── TC Kimlik doğrulama (Türkiye algoritması) ──────────────────────
const isValidTcNo = (tc) => {
  if (!/^\d{11}$/.test(tc)) return false;
  if (tc[0] === '0') return false;
  const d = tc.split('').map(Number);
  const sum10 = (d[0]+d[2]+d[4]+d[6]+d[8]) * 7 - (d[1]+d[3]+d[5]+d[7]);
  if (((sum10 % 10) + 10) % 10 !== d[9]) return false;
  const sum11 = d.slice(0, 10).reduce((a, b) => a + b, 0);
  return sum11 % 10 === d[10];
};

// ── Güvenli metin temizleme ────────────────────────────────────────
const sanitizeText = (value) =>
  value.replace(/[<>"'`]/g, '').slice(0, 100);

const RegisterModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    tcNo: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'INVESTOR',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    // İsim alanlarında tehlikeli karakterleri temizle
    const sanitized = ['firstName', 'lastName'].includes(name)
      ? sanitizeText(value)
      : value;
    setFormData((prev) => ({ ...prev, [name]: sanitized }));
    // Hata mesajını temizle
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};

    if (!formData.firstName.trim() || formData.firstName.trim().length < 2)
      errs.firstName = 'Ad en az 2 karakter olmalıdır.';

    if (!formData.lastName.trim() || formData.lastName.trim().length < 2)
      errs.lastName = 'Soyad en az 2 karakter olmalıdır.';

    if (!isValidTcNo(formData.tcNo))
      errs.tcNo = 'Geçerli bir TC Kimlik Numarası giriniz.';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email))
      errs.email = 'Geçerli bir e-posta adresi giriniz.';

    const cleanPhone = formData.phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 13)
      errs.phoneNumber = 'Geçerli bir telefon numarası giriniz.';

    if (formData.password.length < 8)
      errs.password = 'Şifre en az 8 karakter olmalıdır.';
    else if (!/[A-Z]/.test(formData.password))
      errs.password = 'Şifre en az bir büyük harf içermelidir.';
    else if (!/[0-9]/.test(formData.password))
      errs.password = 'Şifre en az bir rakam içermelidir.';

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    const payload = {
      firstName: formData.firstName.trim(),
      lastName:  formData.lastName.trim(),
      tcNo:      formData.tcNo,
      email:     formData.email.toLowerCase().trim(),
      password:  formData.password,
      phoneNumber: formData.phoneNumber.replace(/\D/g, '') || null,
      role:      formData.role,
    };

    try {
      await api.post('/auth/pending/register', payload);
      toast.success('Kayıt isteğiniz gönderildi. Admin onayı bekleniyor.');
      onClose();
    } catch (error) {
      // API hata mesajını doğrudan gösterme — genel mesaj yeterli
      const status = error.response?.status;
      if (status === 409) {
        toast.error('Bu e-posta veya TC No zaten kayıtlı.');
      } else if (status === 400) {
        toast.error('Girdiğiniz bilgileri kontrol edin.');
      } else {
        toast.error('Kayıt işlemi şu an gerçekleştirilemiyor. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose} aria-label="Kapat">&times;</button>
        <h2 className="modal-title">QuantShine Capital - Hesap Oluştur</h2>

        <form className="register-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="firstName">Adınız</label>
            <input
              type="text" id="firstName" name="firstName"
              value={formData.firstName} onChange={handleChange}
              required minLength={2} maxLength={50}
              autoComplete="given-name"
            />
            {errors.firstName && <span className="field-error">{errors.firstName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Soyadınız</label>
            <input
              type="text" id="lastName" name="lastName"
              value={formData.lastName} onChange={handleChange}
              required minLength={2} maxLength={50}
              autoComplete="family-name"
            />
            {errors.lastName && <span className="field-error">{errors.lastName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="role">Kayıt Türü</label>
            <select id="role" name="role" value={formData.role} onChange={handleChange} required>
              <option value="INVESTOR">Yatırımcı</option>
              <option value="ADVISOR">Danışman</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="tcNo">TC Kimlik Numarası</label>
            <input
              type="text" id="tcNo" name="tcNo"
              value={formData.tcNo} onChange={handleChange}
              maxLength={11} minLength={11}
              pattern="\d{11}" inputMode="numeric"
              required autoComplete="off"
            />
            {errors.tcNo && <span className="field-error">{errors.tcNo}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Telefon Numarası</label>
            <input
              type="tel" id="phoneNumber" name="phoneNumber"
              value={formData.phoneNumber} onChange={handleChange}
              required autoComplete="tel"
              placeholder="05XX XXX XX XX"
            />
            {errors.phoneNumber && <span className="field-error">{errors.phoneNumber}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">E-posta Adresi</label>
            <input
              type="email" id="email" name="email"
              value={formData.email} onChange={handleChange}
              required autoComplete="email"
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Şifre <small>(min. 8 karakter, büyük harf ve rakam)</small></label>
            <input
              type="password" id="password" name="password"
              value={formData.password} onChange={handleChange}
              required minLength={8}
              autoComplete="new-password"
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <button type="submit" className="btn primary register-btn" disabled={loading}>
            {loading ? 'Gönderiliyor...' : 'Kaydol'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal;

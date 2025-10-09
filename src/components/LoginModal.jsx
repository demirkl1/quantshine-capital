import React, { useState } from 'react';
import axios from 'axios';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose }) => {
  // Yalnızca email ve sifre tutulacak
  const [formData, setFormData] = useState({
    email: '',
    sifre: '' // Backend modelinde "sifre" olarak tanımlandığı için burada da "sifre" kullanıyoruz
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Backend'deki Login API'sine POST isteği gönderiyoruz (8081 portu)
      const response = await axios.post('http://localhost:8081/api/auth/login', formData);
      
      // Başarılı giriş (200 OK beklenir)
      setMessage('Giriş başarılı! Uygulamaya yönlendiriliyorsunuz.');
      console.log('Giriş başarılı:', response.data);

      // Başarılı girişten sonra yapılacak işlemler (örneğin JWT token'ı kaydetme, kullanıcıyı ana sayfaya yönlendirme) buraya eklenecek.
      setTimeout(onClose, 1500); // Modalı kapatmadan önce kısa bir gecikme
      
    } catch (error) {
      let errorMessage = 'Giriş işlemi başarısız. Sunucuya ulaşılamıyor.';
      
      if (error.response) {
        // Backend'den hata mesajı geldiyse (400 Bad Request)
        // Login API'mizdeki hata mesajı "E-posta veya şifre hatalı!" beklenir.
        errorMessage = error.response.data || 'Giriş bilgileri hatalı.';
      }

      setMessage(`Hata: ${errorMessage}`);
      console.error('Giriş hatası:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <h2 className="modal-title">Giriş Yap</h2>
        
        {/* Kullanıcı mesajlarını gösterme alanı */}
        {message && (
          <div className={`message-box ${message.includes('Hata') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

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

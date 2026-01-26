import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import keycloak from './keycloak'; // Az önce oluşturduğumuz dosyayı import ediyoruz

const root = ReactDOM.createRoot(document.getElementById('root'));

// Keycloak başlatma ayarları
const initOptions = {
  onLoad: 'login-required', // Giriş zorunlu olsun
  checkLoginIframe: false   // Localhost'ta bazen sorun çıkarıyor, kapattık
};

keycloak.init(initOptions).then((authenticated) => {
  if (authenticated) {
    // Sadece giriş başarılıysa uygulamayı ekrana bas
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    // Giriş başarısızsa sayfayı yenile (Keycloak otomatik login'e atar)
    window.location.reload();
  }
}).catch((err) => {
  console.error("Keycloak Başlatma Hatası:", err);
  root.render(
    <div style={{ padding: "20px", color: "red", textAlign: "center" }}>
      <h2>Sisteme Giriş Yapılamadı!</h2>
      <p>Keycloak servisinin çalıştığından emin olun.</p>
    </div>
  );
});

reportWebVitals();
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import keycloak from './keycloak';

const root = ReactDOM.createRoot(document.getElementById('root'));

// ✅ 1. ADIM: Ayarı 'check-sso' yapıyoruz. 
// Bu, "giriş yapılmış mı bak ama yapılmadıysa zorlama" demek.
const initOptions = {
  onLoad: 'check-sso', 
  checkLoginIframe: false
};

keycloak.init(initOptions).then(() => {
  // ✅ 2. ADIM: 'authenticated' şartını kaldırıyoruz. 
  // Artık her durumda Uygulama (App) render edilecek.
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}).catch((err) => {
  console.error("Keycloak Başlatma Hatası:", err);
  // Hata olsa bile Landing Page'i görmesi için yine App'i render edebilirsin 
  // veya hata mesajını bırakabilirsin.
  root.render(<App />); 
});

reportWebVitals();
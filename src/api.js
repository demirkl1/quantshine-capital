import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081/api',
  timeout: 15000,          // 15 saniye zaman aşımı — sonsuz beklemeyi önler
  withCredentials: false,  // CSRF'e maruz kalma riskini minimize et
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // CSRF koruması için sunucu tarafı kontrolü
  },
});

// ── Request Interceptor: Token ekleme ────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // Auth endpoint'lerine token eklenmez
    if (token && !config.url?.includes('/auth/')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Hata yönetimi ─────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // Token geçersiz veya süresi dolmuş — oturumu kapat
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      // window.location yerine olayı dispatch et (React dışından yönlendirme)
      window.dispatchEvent(new Event('auth:logout'));
      window.location.href = '/';
    }

    // Zaman aşımı
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('İstek zaman aşımına uğradı. Lütfen tekrar deneyin.'));
    }

    // Ağ hatası
    if (!error.response) {
      return Promise.reject(new Error('Sunucuya ulaşılamıyor. Bağlantınızı kontrol edin.'));
    }

    return Promise.reject(error);
  }
);

export default api;

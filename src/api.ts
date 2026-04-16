import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// ── In-memory GET cache ───────────────────────────────────────────────────
interface CacheEntry {
  data: unknown;
  ts: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 30_000; // 30 saniye

const getCacheKey = (url: string | undefined, params: unknown): string =>
  `${url ?? ''}::${JSON.stringify(params ?? '')}`;

// ── Axios instance ────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081/api',
  timeout: 15000,          // 15 saniye zaman aşımı — sonsuz beklemeyi önler
  withCredentials: false,  // CSRF'e maruz kalma riskini minimize et
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // CSRF koruması için sunucu tarafı kontrolü
  },
});

// ── Request Interceptor: Token ekleme + GET cache ─────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    // Auth endpoint'lerine token eklenmez
    if (token && !config.url?.includes('/auth/')) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Cache kontrolü — sadece GET istekleri için
    if (config.method === 'get') {
      const key = getCacheKey(config.url, config.params);
      const hit = cache.get(key);
      if (hit && Date.now() - hit.ts < CACHE_TTL) {
        const cachedData = hit.data;
        config.adapter = () =>
          Promise.resolve({
            data: cachedData,
            status: 200,
            statusText: 'OK (cached)',
            headers: {},
            config,
          } as AxiosResponse);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Cache kaydetme + hata yönetimi ─────────────────
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Başarılı GET yanıtlarını cache'e yaz
    if (response.config.method === 'get') {
      const key = getCacheKey(response.config.url, response.config.params);
      cache.set(key, { data: response.data, ts: Date.now() });
    }
    return response;
  },
  (error) => {
    const status = error.response?.status as number | undefined;

    // Token geçersiz veya süresi dolmuş — oturumu kapat
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
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

/** Belirli bir URL prefix'i için cache'i temizler (mutating isteklerden sonra çağrılabilir) */
export const clearApiCache = (urlPrefix?: string): void => {
  if (!urlPrefix) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.startsWith(urlPrefix)) {
      cache.delete(key);
    }
  }
};

export default api;

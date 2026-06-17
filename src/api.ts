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
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api',
  timeout: 15000,          // 15 saniye zaman aşımı — sonsuz beklemeyi önler
  withCredentials: true,   // Auth artık HttpOnly cookie ile taşınır → cookie'ler gönderilsin
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // CSRF koruması için sunucu tarafı kontrolü
  },
});

// ── Request Interceptor: GET cache ────────────────────────────────────────
// Not: Token artık localStorage'da değil HttpOnly cookie'de; Authorization
// header eklenmez — tarayıcı cookie'yi otomatik gönderir.
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
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

// ── Şeffaf token yenileme (BFF) ───────────────────────────────────────────
// 401 alındığında refresh cookie'siyle /auth/refresh denenir, ardından orijinal
// istek bir kez tekrar edilir. Eşzamanlı 401'lerde tek refresh paylaşılır.
let refreshPromise: Promise<boolean> | null = null;

const isAuthEndpoint = (url?: string): boolean => !!url && url.includes('/auth/');

const tryRefresh = (): Promise<boolean> => {
  if (!refreshPromise) {
    refreshPromise = api
      .post('/auth/refresh')
      .then(() => true)
      .catch(() => false)
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
};

// ── Response Interceptor: Cache kaydetme + 401 yenileme + hata yönetimi ────
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Başarılı GET yanıtlarını cache'e yaz
    if (response.config.method === 'get') {
      const key = getCacheKey(response.config.url, response.config.params);
      cache.set(key, { data: response.data, ts: Date.now() });
    }
    return response;
  },
  async (error) => {
    const status = error.response?.status as number | undefined;
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    // Token süresi dolmuş olabilir → bir kez yenilemeyi dene, isteği tekrarla.
    // Auth uçlarında (login/refresh/logout) ve ikinci denemede yenileme yapma.
    if (status === 401 && original && !original._retry && !isAuthEndpoint(original.url)) {
      original._retry = true;
      const refreshed = await tryRefresh();
      if (refreshed) {
        return api(original);
      }
      // Yenileme başarısız — oturumu kapat
      window.dispatchEvent(new Event('auth:logout'));
      return Promise.reject(error);
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

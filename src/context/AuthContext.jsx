import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import keycloak from '../keycloak';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth, bir AuthProvider içinde kullanılmalıdır.");
    return context;
};

// ── Token bütünlüğünü kontrol et ──────────────────────────────────────
const isTokenStructurallyValid = (token) => {
    if (!token || typeof token !== 'string') return false;
    // JWT formatı: üç noktalı üç Base64 bölüm
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    try {
        const decoded = jwtDecode(token);
        // Zorunlu JWT alanları mevcut mu?
        if (!decoded.sub || !decoded.exp || !decoded.iat) return false;
        // Token süresi dolmuş mu?
        if (decoded.exp < Math.floor(Date.now() / 1000)) return false;
        return true;
    } catch {
        return false;
    }
};

// ── Tüm oturum verilerini temizle ────────────────────────────────────
const clearSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    // Gelecekte eklenebilecek diğer oturum anahtarları
    sessionStorage.clear();
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => {
        // Başlangıçta token varsa ve yapısal olarak geçerliyse al
        const stored = localStorage.getItem('token');
        return isTokenStructurallyValid(stored) ? stored : null;
    });
    const [loading, setLoading] = useState(true);

    const parseUserFromToken = useCallback((accessToken) => {
        if (!accessToken) return null;
        try {
            const decoded = jwtDecode(accessToken);
            const roles = decoded.realm_access?.roles || [];
            return {
                id: decoded.sub,
                email: decoded.email,
                name: decoded.name || `${decoded.given_name || ''} ${decoded.family_name || ''}`.trim(),
                roles: roles,
                isAdmin: roles.includes('ADMIN'),
                isAdvisor: roles.includes('ADVISOR'),
                isInvestor: roles.includes('INVESTOR'),
                managedFundCode: decoded.managedFundCode,
                isAuthenticated: true
            };
        } catch {
            return null;
        }
    }, []);

    // ── Çıkış ────────────────────────────────────────────────────────
    const logout = useCallback(async () => {
        clearSession();
        setToken(null);
        setUser(null);
        if (keycloak.authenticated) {
            try {
                await keycloak.logout({ redirectUri: window.location.origin });
            } catch {
                // Keycloak logout başarısız olsa da local oturum temizlendi
                window.location.href = '/';
            }
        }
    }, []);

    // ── ROPC kullanıcıları için token yenileme ───────────────────────
    const refreshTokenDirectly = useCallback(async () => {
        const currentToken = localStorage.getItem('token');
        if (currentToken) {
            try {
                const { exp } = jwtDecode(currentToken);
                if (exp - Math.floor(Date.now() / 1000) > 70) return;
            } catch {
                // süresi okunamazsa yenile
            }
        }

        const storedRefreshToken = localStorage.getItem('refresh_token');
        if (!storedRefreshToken) {
            logout();
            return;
        }

        try {
            const keycloakUrl = process.env.REACT_APP_KEYCLOAK_URL || 'http://localhost:9090';
            const realm       = process.env.REACT_APP_KEYCLOAK_REALM    || 'quantshine';
            const clientId    = process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 'quantshine-backend';

            const params = new URLSearchParams({
                grant_type:    'refresh_token',
                refresh_token: storedRefreshToken,
                client_id:     clientId,
            });

            const response = await fetch(
                `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: params.toString(),
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (!data.access_token) { logout(); return; }
                localStorage.setItem('token', data.access_token);
                if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
                setToken(data.access_token);
                setUser(parseUserFromToken(data.access_token));
            } else {
                logout();
            }
        } catch {
            logout();
        }
    }, [logout, parseUserFromToken]);

    // ── Giriş ────────────────────────────────────────────────────────
    const login = useCallback((data) => {
        const accessToken = data.access_token || data.token;
        if (accessToken && isTokenStructurallyValid(accessToken)) {
            localStorage.setItem('token', accessToken);
            if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
            setToken(accessToken);
            setUser(parseUserFromToken(accessToken));
        }
    }, [parseUserFromToken]);

    // ── Periyodik yenileme (60 sn) ───────────────────────────────────
    useEffect(() => {
        if (!token) return;
        const refreshInterval = setInterval(() => {
            if (keycloak.authenticated) {
                keycloak.updateToken(70)
                    .then((refreshed) => {
                        if (refreshed) {
                            const newToken = keycloak.token;
                            localStorage.setItem('token', newToken);
                            setToken(newToken);
                            setUser(parseUserFromToken(newToken));
                        }
                    })
                    .catch(logout);
            } else {
                refreshTokenDirectly();
            }
        }, 60000);
        return () => clearInterval(refreshInterval);
    }, [token, parseUserFromToken, logout, refreshTokenDirectly]);

    // ── Başlangıç: Keycloak SSO veya localStorage token ─────────────
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const authenticated = await keycloak.init({
                    onLoad: 'check-sso',
                    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
                    pkceMethod: 'S256',
                    checkLoginIframe: false,
                });

                if (authenticated) {
                    const accessToken = keycloak.token;
                    localStorage.setItem('token', accessToken);
                    setToken(accessToken);
                    setUser(parseUserFromToken(accessToken));
                } else {
                    const storedToken = localStorage.getItem('token');
                    if (storedToken) {
                        if (isTokenStructurallyValid(storedToken)) {
                            setToken(storedToken);
                            setUser(parseUserFromToken(storedToken));
                        } else {
                            // Geçersiz veya süresi dolmuş token — yenilemeyi dene
                            const refreshTok = localStorage.getItem('refresh_token');
                            if (refreshTok) {
                                await refreshTokenDirectly();
                            } else {
                                clearSession();
                            }
                        }
                    }
                }
            } catch {
                // Keycloak başlatma hatası — sessizce devam et
            } finally {
                setLoading(false);
            }
        };
        initializeAuth();
    }, [parseUserFromToken, refreshTokenDirectly]);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

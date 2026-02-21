import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import keycloak from '../keycloak';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth, bir AuthProvider içinde kullanılmalıdır.");
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const parseUserFromToken = useCallback((accessToken) => {
        if (!accessToken) return null;
        try {
            const decoded = jwtDecode(accessToken);
            const roles = decoded.realm_access?.roles || [];
            return {
                id: decoded.sub,
                email: decoded.email,
                name: decoded.name || `${decoded.given_name} ${decoded.family_name}`,
                roles: roles,
                isAdmin: roles.includes('ADMIN'),
                isAdvisor: roles.includes('ADVISOR'),
                isInvestor: roles.includes('INVESTOR'),
                managedFundCode: decoded.managedFundCode,
                isAuthenticated: true
            };
        } catch { return null; }
    }, []);

    // --- Çıkış ---
    const logout = useCallback(async () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        setToken(null);
        setUser(null);
        if (keycloak.authenticated) {
            await keycloak.logout({ redirectUri: window.location.origin });
        }
    }, []);

    // --- ROPC kullanıcıları için Keycloak token endpoint'i üzerinden yenileme ---
    const refreshTokenDirectly = useCallback(async () => {
        // Mevcut token'ın ömrü 70 saniyeden fazlaysa yenileme gerekmez
        const currentToken = localStorage.getItem('token');
        if (currentToken) {
            try {
                const { exp } = jwtDecode(currentToken);
                if (exp - Math.floor(Date.now() / 1000) > 70) return;
            } catch { /* süresi okunamazsa yenile */ }
        }

        const storedRefreshToken = localStorage.getItem('refresh_token');
        if (!storedRefreshToken) {
            logout();
            return;
        }

        try {
            const keycloakUrl = process.env.REACT_APP_KEYCLOAK_URL || 'http://localhost:9090';
            const realm     = process.env.REACT_APP_KEYCLOAK_REALM    || 'quantshine';
            const clientId  = process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 'quantshine-backend';

            const params = new URLSearchParams({
                grant_type:    'refresh_token',
                refresh_token: storedRefreshToken,
                client_id:     clientId,
            });

            const response = await fetch(
                `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`,
                { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params.toString() }
            );

            if (response.ok) {
                const data = await response.json();
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

    // --- Giriş: access_token + refresh_token sakla ---
    const login = useCallback((data) => {
        const accessToken = data.access_token || data.token;
        if (accessToken) {
            localStorage.setItem('token', accessToken);
            if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
            setToken(accessToken);
            setUser(parseUserFromToken(accessToken));
        }
    }, [parseUserFromToken]);

    // --- Periyodik yenileme (60 sn): Keycloak SSO veya ROPC ---
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
                // ROPC kullanıcısı: direkt Keycloak token endpoint'i
                refreshTokenDirectly();
            }
        }, 60000);
        return () => clearInterval(refreshInterval);
    }, [token, parseUserFromToken, logout, refreshTokenDirectly]);

    // --- Başlangıç: Keycloak SSO yoksa localStorage'dan user kur ---
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const authenticated = await keycloak.init({
                    onLoad: 'check-sso',
                    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
                    pkceMethod: 'S256',
                    checkLoginIframe: false
                });

                if (authenticated) {
                    // Keycloak SSO ile giriş yapılmış
                    const accessToken = keycloak.token;
                    localStorage.setItem('token', accessToken);
                    setToken(accessToken);
                    setUser(parseUserFromToken(accessToken));
                } else {
                    // SSO yok — localStorage'da ROPC token'ı var mı?
                    const storedToken = localStorage.getItem('token');
                    if (storedToken) {
                        try {
                            const { exp } = jwtDecode(storedToken);
                            const isExpired = exp < Math.floor(Date.now() / 1000);
                            if (!isExpired) {
                                // Token hâlâ geçerli, user'ı kur
                                setUser(parseUserFromToken(storedToken));
                            } else {
                                // Token süresi dolmuş, refresh_token ile yenile
                                await refreshTokenDirectly();
                            }
                        } catch {
                            localStorage.removeItem('token');
                            localStorage.removeItem('refresh_token');
                        }
                    }
                }
            } catch (e) {
                console.error("Keycloak başlatma hatası:", e);
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

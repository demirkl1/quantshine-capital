import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';
import type { User, BackendUser, AuthContextValue } from '../types';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = (): AuthContextValue => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth, bir AuthProvider içinde kullanılmalıdır.");
    return context;
};

// ── Backend User entity → frontend User modeli ───────────────────────────
// Auth artık cookie tabanlı; istemci JWT decode etmez. Profil /api/users/me
// (ve login yanıtı) üzerinden gelir.
const mapUser = (u: BackendUser): User | null => {
    if (!u) return null;
    const role = u.role;
    const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
    return {
        id: u.keycloakId ?? (u.id != null ? String(u.id) : ''),
        email: u.email,
        name: name || u.email,
        roles: role ? [role] : [],
        isAdmin: role === 'ADMIN',
        isAdvisor: role === 'ADVISOR',
        isInvestor: role === 'INVESTOR',
        managedFundCode: u.managedFundCode,
        isAuthenticated: true,
    };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // ── Giriş ────────────────────────────────────────────────────────
    // Backend cookie'leri zaten set etti; gövdedeki profil ile state'i kur.
    const login = useCallback((data: BackendUser): void => {
        setUser(mapUser(data));
    }, []);

    // ── Çıkış ────────────────────────────────────────────────────────
    const logout = useCallback(async (): Promise<void> => {
        try {
            await api.post('/auth/logout');
        } catch {
            // cookie'ler yine de geçersiz kılınmalı; hatayı yut
        }
        setUser(null);
        window.location.href = '/';
    }, []);

    // ── Başlangıç: cookie ile oturum var mı? ─────────────────────────
    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const res = await api.get('/users/me');
                if (active) setUser(mapUser(res.data));
            } catch {
                if (active) setUser(null);
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, []);

    // ── api.ts 401/refresh başarısızlığında oturumu temizle ──────────
    useEffect(() => {
        const onLogout = () => setUser(null);
        window.addEventListener('auth:logout', onLogout);
        return () => window.removeEventListener('auth:logout', onLogout);
    }, []);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

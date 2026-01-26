import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
        // Local storage'dan initialUser çekilir
        const initialUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

        const [user, setUser] = useState(initialUser);
        const [isAuthenticated, setIsAuthenticated] = useState(!!initialUser);
        const [loading, setLoading] = useState(false);

        useEffect(() => {
                // Güvenlik kontrolü için kullanılabilir.
        }, []);

        const login = (data) => {
                // 1. Yeni veriyi, Backend yanıtından (data) alarak hazırlar.
                const transformedUser = {
                        name: data.user.ad,
                        surname: data.user.soyad,
                        email: data.user.email, // ⭐️ Doğru yol: data.user.email'den al
                        isAdmin: data.admin || false
                };

                // 2. 🚨 KRİTİK: Önce eski veriyi temizle (Kalıntı kalmasını önler)
                // Bu adım, hatalı e-posta verilerinin kalmasını önler.
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // 3. Yeni ve doğru veriyi kaydet
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(transformedUser));

                // 4. State'leri güncelle
                setUser(transformedUser);
                setIsAuthenticated(true);
        };

        const logout = () => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
                setIsAuthenticated(false);
        };

        const value = { user, isAuthenticated, loading, login, logout };

        return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
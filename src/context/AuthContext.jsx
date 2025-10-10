import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext); // named export: hook

const AuthProvider = ({ children }) => {
  const initialUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  const [user, setUser] = useState(initialUser);
  const [isAuthenticated, setIsAuthenticated] = useState(!!initialUser);
  const [loading, setLoading] = useState(false);

  useEffect(() => {}, []);

  const login = (data) => {
    const transformedUser = {
      name: data.user.name || data.user.ad,
      surname: data.user.surname || data.user.soyad,
      email: data.user.email
    };

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(transformedUser));

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

export default AuthProvider; // default export

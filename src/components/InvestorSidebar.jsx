import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  MdAccountBalanceWallet,
  MdHistory,
  MdDateRange,
  MdSupportAgent,
  MdLogout,
  MdMenu,
  MdClose
} from 'react-icons/md';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './InvestorSidebar.css';

const InvestorSidebar = () => {
  const location = useLocation();
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Yatırımcı DB kaydını senkronize et (Keycloak'ta var ama DB'de yoksa oluşturur)
  useEffect(() => {
    if (!token) return;
    api.get('/users/me').catch(() => {});
  }, [token]);

  const menuItems = [
    { path: '/yatirimci-anasayfa', name: 'Portföyüm', icon: <MdAccountBalanceWallet /> },
    { path: '/yatirim-gecmisim', name: 'Yatırım Geçmişim', icon: <MdHistory /> },
    { path: '/haftalik-rapor', name: 'Haftalık Rapor', icon: <MdDateRange /> },
    { path: '/danisman-profili', name: 'Danışman Profili', icon: <MdSupportAgent /> },
  ];

  return (
    <>
      <div className="mobile-topbar">
        <h2 className="mobile-logo">Quant&Shine</h2>
        <button className="hamburger-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <MdClose /> : <MdMenu />}
        </button>
      </div>
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}
      <div className={`investor-sidebar${isOpen ? ' open' : ''}`}>
        <div className="sidebar-logo">
          <h2>Quant&Shine</h2>
          <span>Yatırımcı Paneli</span>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="nav-item logout-btn" onClick={() => setIsOpen(false)}>
            <span className="nav-icon"><MdLogout /></span>
            <span className="nav-text">Çıkış Yap</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default InvestorSidebar;

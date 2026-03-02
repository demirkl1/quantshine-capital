import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  MdAccountBalanceWallet,
  MdHistory,
  MdDateRange,
  MdSupportAgent,
  MdLogout
} from 'react-icons/md';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './InvestorSidebar.css';

const InvestorSidebar = () => {
  const location = useLocation();
  const { token } = useAuth();

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
    <div className="investor-sidebar">
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
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-text">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <Link to="/" className="nav-item logout-btn">
          <span className="nav-icon"><MdLogout /></span>
          <span className="nav-text">Çıkış Yap</span>
        </Link>
      </div>
    </div>
  );
};

export default InvestorSidebar;
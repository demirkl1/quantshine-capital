import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  MdDashboard,
  MdSupportAgent,
  MdPeople,
  MdPersonAdd,
  MdSwapHoriz,
  MdPieChart,
  MdHistory,
  MdAssessment,
  MdAccountCircle,
  MdLogout,
  MdMenu,
  MdClose
} from 'react-icons/md';
import './AdminSidebar.css';

const AdminSidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { path: '/admin-anasayfa', name: 'Ana Sayfa', icon: <MdDashboard /> },
    { path: '/danismanlar', name: 'Danışmanlar', icon: <MdSupportAgent /> },
    { path: '/yatirimcilar', name: 'Yatırımcılar', icon: <MdPeople /> },
    { path: '/yatirimci-istekleri', name: 'İstekler', icon: <MdPersonAdd /> },
    { path: '/islem-sayfasi', name: 'İşlem Sayfası', icon: <MdSwapHoriz /> },
    { path: '/yonetici-fon', name: 'Fonlar', icon: <MdPieChart /> },
    { path: '/yonetici-islem-gecmisi', name: 'İşlem Geçmişi', icon: <MdHistory /> },
    { path: '/raporlama', name: 'Raporlama', icon: <MdAssessment /> },
    { path: '/profil', name: 'Profil', icon: <MdAccountCircle /> },
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
      <div className={`admin-sidebar${isOpen ? ' open' : ''}`}>
        <div className="sidebar-logo">
          <h2>Quant&Shine</h2>
          <span>Yönetim Paneli</span>
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

export default AdminSidebar;

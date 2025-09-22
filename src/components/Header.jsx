import React from 'react';
import './Header.css';
import { Link } from 'react-router-dom';

const Header = ({ showAuthButtons, onLoginClick, onRegisterClick }) => {
  return (
    <header className="header-container">
       <Link to="/" className="logo-link">
        <h1 className="logo">QuantShine Capital</h1>
      </Link>
      <nav className="nav-section">
        <ul>
          <li><Link to="/hakkimizda">Hakkımızda</Link></li>
          <li><Link to="/fonlarimiz">Fonlarımız</Link></li>

          {/* Hover ile açılan dropdown */}
          <li className="dropdown">
            <span>Portföy Yönetimi</span>
            <ul className="dropdown-content">
              <li><Link to="/portfoy-bireysel">Bireysel Yatırımcılar</Link></li>
              <li><Link to="/portfoy-kurumsal">Kurumsal Yatırımcılar</Link></li>
            </ul>
          </li>

          <li><Link to="/sss">S.S.S.</Link></li>
        </ul>
      </nav>

      <div className="auth-buttons-section">
        {showAuthButtons && (
          <>
            <button className="btn primary" onClick={onLoginClick}>Yatırımcı Girişi</button>
            <button className="btn secondary" onClick={onRegisterClick}>Yatırımcı Ol</button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;

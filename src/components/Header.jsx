import React from "react";
import "./Header.css";
import { Link } from "react-router-dom";

const Header = ({ showAuthButtons, onLoginClick, onRegisterClick }) => {
  return (
    <header className="header-container">
      {/* 1. LOGO ALANI */}
      <div className="logo-section">
        <Link to="/" className="logo-link">
          <h1 className="logo">
            <span className="highlight">Quant&</span>Shine <span>Capital</span>
          </h1>
        </Link>
      </div>

      {/* 2. NAVİGASYON (Orta) */}
      <nav className="nav-section">
        <ul>
          <li><Link to="/hakkimizda">Hakkımızda</Link></li>
          <li><Link to="/fonlarimiz">Fonlarımız</Link></li>
          <li className="dropdown">
            <span className="dropdown-trigger">Portföy Yönetimi</span>
            <ul className="dropdown-content">
              <li><Link to="/portfoy-bireysel">Bireysel Yatırımcılar</Link></li>
              <li><Link to="/portfoy-kurumsal">Kurumsal Yatırımcılar</Link></li>
            </ul>
          </li>
          <li><Link to="/sss">S.S.S.</Link></li>
        </ul>
      </nav>

      {/* 3. AUTH BUTTONS (Sağ) */}
      <div className="auth-section">
        {showAuthButtons && (
          <div className="auth-buttons-group">
            <button className="btn-login" onClick={onLoginClick}>Giriş Yap</button>
            <button className="btn-register" onClick={onRegisterClick}>Üye Ol</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
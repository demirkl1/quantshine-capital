import React from "react";
import "./Header.css";
import { Link } from "react-router-dom";

const Header = ({ showAuthButtons, onLoginClick, onRegisterClick }) => {
  return (
    <header className="header-container glass-effect">
      {/* LOGO */}
      <Link to="/" className="logo-link">
        <h1 className="logo">
          <span className="highlight">Quant</span>Shine <span>Capital</span>
        </h1>
      </Link>

      {/* NAVIGATION */}
      <nav className="nav-section">
        <ul>
          <li>
            <Link to="/hakkimizda">Hakkımızda</Link>
          </li>
          <li>
            <Link to="/fonlarimiz">Fonlarımız</Link>
          </li>
          <li className="dropdown">
            <span>Portföy Yönetimi</span>
            <ul className="dropdown-content">
              <li>
                <Link to="/portfoy-bireysel">Bireysel Yatırımcılar</Link>
              </li>
              <li>
                <Link to="/portfoy-kurumsal">Kurumsal Yatırımcılar</Link>
              </li>
            </ul>
          </li>
          <li>
            <Link to="/sss">S.S.S.</Link>
          </li>
        </ul>
      </nav>

      {/* AUTH BUTTONS */}
      {showAuthButtons && (
        <div className="auth-buttons-section">
          <button className="btn primary" onClick={onLoginClick}>
            <i className="fas fa-user-lock"></i> Giriş Yap
          </button>
          <button className="btn secondary" onClick={onRegisterClick}>
            <i className="fas fa-user-plus"></i> Üye Ol
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;

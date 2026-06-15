import React from "react";
import "./Header.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

const Header = ({ showAuthButtons, user, onLoginClick, onRegisterClick }) => {
  const { t } = useTranslation();
  const dashboardPath = user?.isAdmin
    ? '/admin-anasayfa'
    : user?.isAdvisor
    ? '/danisman-anasayfa'
    : '/yatirimci-anasayfa';

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
          <li><Link to="/hakkimizda">{t("nav.about")}</Link></li>
          <li><Link to="/fonlarimiz">{t("nav.funds")}</Link></li>
          <li className="dropdown">
            <span className="dropdown-trigger">{t("nav.portfolio")}</span>
            <ul className="dropdown-content">
              <li><Link to="/portfoy-bireysel">{t("nav.individual")}</Link></li>
              <li><Link to="/portfoy-kurumsal">{t("nav.corporate")}</Link></li>
            </ul>
          </li>
          <li className="dropdown">
            <span className="dropdown-trigger">{t("nav.tools")}</span>
            <ul className="dropdown-content">
              <li><Link to="/simulasyon">{t("nav.simulator")}</Link></li>
              <li><Link to="/fon-karsilastir">{t("nav.compare")}</Link></li>
              <li><Link to="/yerindelik-testi">{t("nav.suitability")}</Link></li>
            </ul>
          </li>
          <li><Link to="/sss">{t("nav.faq")}</Link></li>
          <li><Link to="/iletisim">{t("nav.contact")}</Link></li>
        </ul>
      </nav>

      {/* 3. AUTH BUTTONS (Sağ) */}
      <div className="auth-section">
        <LanguageSwitcher />
        {showAuthButtons ? (
          <div className="auth-buttons-group">
            <button className="btn-login" onClick={onLoginClick}>{t("nav.login")}</button>
            <button className="btn-register" onClick={onRegisterClick}>{t("nav.register")}</button>
          </div>
        ) : user ? (
          <div className="auth-buttons-group">
            <Link to={dashboardPath} className="btn-register">{t("nav.goToPanel")}</Link>
          </div>
        ) : null}
      </div>
    </header>
  );
};

export default Header;

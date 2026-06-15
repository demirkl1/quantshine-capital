import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Instagram, Linkedin, Twitter, Mail, Phone } from "lucide-react";
import "./Footer.css";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="footer-section">
      <div className="footer-top">
        {/* Marka */}
        <div className="footer-brand">
          <h3 className="footer-logo">
            <span className="footer-logo-accent">Quant&</span>Shine Capital
          </h3>
          <p className="footer-desc">{t("footer.desc")}</p>
          <div className="footer-social">
            <a href="https://instagram.com/quantshinecapital" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={18} /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin size={18} /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="X"><Twitter size={18} /></a>
          </div>
        </div>

        {/* Kurumsal */}
        <div className="footer-col">
          <h4>{t("footer.corporate")}</h4>
          <ul>
            <li><Link to="/hakkimizda">{t("nav.about")}</Link></li>
            <li><Link to="/ekip">{t("nav.team")}</Link></li>
            <li><Link to="/fonlarimiz">{t("nav.funds")}</Link></li>
            <li><Link to="/iletisim">{t("nav.contact")}</Link></li>
          </ul>
        </div>

        {/* Araçlar */}
        <div className="footer-col">
          <h4>{t("footer.toolsTitle")}</h4>
          <ul>
            <li><Link to="/simulasyon">{t("nav.simulator")}</Link></li>
            <li><Link to="/fon-karsilastir">{t("nav.compare")}</Link></li>
            <li><Link to="/yerindelik-testi">{t("nav.suitability")}</Link></li>
            <li><Link to="/sss">{t("nav.faq")}</Link></li>
          </ul>
        </div>

        {/* Yasal */}
        <div className="footer-col">
          <h4>{t("footer.legalTitle")}</h4>
          <ul>
            <li><Link to="/kvkk">{t("legal.kvkk.title")}</Link></li>
            <li><Link to="/yasal-uyari">{t("legal.disclaimer.title")}</Link></li>
            <li><Link to="/cerez-politikasi">{t("legal.cookies.title")}</Link></li>
          </ul>
        </div>

        {/* İletişim */}
        <div className="footer-col footer-contact">
          <h4>{t("footer.contactTitle")}</h4>
          <a href="mailto:manager@quantshinecapital.com" className="footer-contact-item">
            <Mail size={16} /> manager@quantshinecapital.com
          </a>
          <a href="tel:+901234567890" className="footer-contact-item">
            <Phone size={16} /> +90 123 456 78 90
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-rights">{t("footer.rights")}</p>
        <p className="footer-risk">{t("footer.riskNote")}</p>
      </div>
    </footer>
  );
}

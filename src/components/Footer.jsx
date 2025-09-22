import React from "react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-left">
          <h3>QuantShine Capital</h3>
          <p>© 2025 Tüm Hakları Saklıdır.</p>
        </div>
        <div className="footer-right">
          <h4>Bize Ulaşın</h4>
          <p>Email: info@quantshine.com</p>
          <p>Telefon: +90 123 456 78 90</p>
          <div className="social-icons">
            <a
              href="https://instagram.com/quantshine"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
            <a
              href="https://linkedin.com/company/quantshine"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

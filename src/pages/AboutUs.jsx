import React, { useState } from 'react';    
import "./AboutUs.css";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";

export default function AboutPage() {
  return (
    <div className="about-container">
<div class="page-title-section">
  <div class="page-title-container">
    <h1 class="page-title">HAKKIMIZDA</h1>
    <p class="page-subtitle">Finansal vizyonumuzu ileriye taşımak için buradayız.</p>
  </div>
</div>

      {/* Orta beyaz kısım */}
      <div className="about-section">
        <div className="about-content">
          <div className="about-media">
            <img
              src="/quantshine_capital.png"
              alt="QuantShine Capital"
            />
          </div>
          <div className="about-text">
            <h2>Biz Kimiz?</h2>
            <p>
              QuantShine Capital, yenilikçi finansal çözümler ve güçlü yatırım
              stratejileri ile müşterilerine değer katmayı hedefleyen bir
              şirkettir. Deneyimli ekibimiz, veriye dayalı analizlerle geleceğin
              fırsatlarını bugünden sunmaktadır.
            </p>
            <p>
              Vizyonumuz, global finans dünyasında güvenilir, yenilikçi ve
              sürdürülebilir çözümler sunarak lider konumda olmaktır.
            </p>
          </div>
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
}

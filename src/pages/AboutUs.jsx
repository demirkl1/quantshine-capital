import React from 'react';    
import "./AboutUs.css";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";

export default function AboutPage() {
  return (
    <div className="about-container">
      {/* Sayfa Başlığı Alanı */}
      <div className="page-title-section">
        <div className="page-title-container">
          <h1 className="page-title">HAKKIMIZDA</h1>
          <div className="title-separator"></div>
          <p className="page-subtitle">Finansal vizyonumuzu ileriye taşımak için buradayız.</p>
        </div>
      </div>

      {/* İçerik Bölümü */}
      <div className="about-section">
        <div className="about-content">
          <div className="about-media">
            <div className="media-glass-frame">
              <img
                src="/quantshine_capital.png"
                alt="QuantShine Capital"
              />
            </div>
          </div>
          
          <div className="about-text">
            <h2 className="section-heading">Biz Kimiz?</h2>
            <p>
              <strong>Quant&Shine Capital</strong>, 2026 yılında kurulan Quantshine, yatırım yönetimini veri, disiplin ve risk kontrolü temelleri üzerine inşa eden bağımsız bir portföy yönetim yapısıdır. Önceliğimiz, yatırımcılarımızın sermayesini korumak; ardından kontrollü ve sürdürülebilir getiri üretmektir.

Tüm yatırım kararlarımız, ölçülebilir risk parametreleri, makroekonomik analizler ve sistematik stratejiler doğrultusunda alınır. Algoritmik modeller, yazılım destekli analiz süreçleri ve türev araçlarla risk dengeleme yaklaşımımız, portföylerimizi değişen piyasa koşullarına karşı dinamik şekilde konumlandırmamızı sağlar.

            </p>
            <p>
              Yerel ve küresel finansal dinamikleri birlikte değerlendirerek hem kurumsal hem de bireysel yatırımcılara profesyonel, şeffaf ve disiplinli portföy yönetim hizmeti sunuyoruz.

Bizim için başarı; kısa vadeli kazançtan ziyade, kontrollü risk altında uzun vadeli değer üretmektir.
            </p>
            
            <div className="about-values">
              <div className="value-tag">Güven</div>
              <div className="value-tag">Şeffaflık</div>
              <div className="value-tag">İnovasyon</div>
            </div>
          </div>
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
}
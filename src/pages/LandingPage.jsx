// src/pages/LandingPage.jsx
import React, { useState } from "react";
import ScrollToTop from "../components/ScrollToTop";
import "./LandingPage.css";


const LandingPage = () => {
  return (
    <div className="landing-page-container">


      {/* Hero Section */}
      <section
        id="anasayfa"
        className="hero-section"
        style={{
          backgroundImage: "url('/quantshinemainpage.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "100vh",
          position: "relative",
          color: "white",
        }}
      >
        <div className="hero-overlay">
          <div className="hero-content">
            <h2 className="hero-title">Geleceğin Finansına Hoş Geldiniz</h2>
            <p className="hero-description">
              QuantShine Capital ile finansal hedeflerinize ulaşın. Akıllı yatırım araçları,
              güvenli işlemler ve uzman desteğiyle.
            </p>
            <button className="btn primary hero-btn">Hemen Keşfet</button>
          </div>
        </div>
      </section>

      {/* Hakkımızda Section */}
      <section id="hakkimizda" className="about-section">
        <div className="about-card">
          <h3>Bireysel Yatırımcılar</h3>
          <p>
            Yatırımcılarımızın getiri beklentisi ve risk toleransına uygun portföy çeşitlendirme ve
            küresel fırsatlardan yararlanma imkanı sunmaktayız.
          </p>
          <button className="btn secondary">Daha Fazla Bilgi</button>
        </div>
        <div className="about-card">
          <h3>Kurumsal Yatırımcılar</h3>
          <p>
            Sigorta şirketleri, emeklilik fonları, vakıflar, aile şirketleri, özel ve kamu şirketleri
            gibi kurumsal şirketler için kendi belirledikleri risk/getiri profillerine ve
            sınırlamalarına uygun portföyler oluşturuyoruz.
          </p>
          <button className="btn secondary">Daha Fazla Bilgi</button>
        </div>
      </section>

      {/* Markets Section */}
      <section id="markets" className="markets-section">
        <div className="card-grid">
          <div className="market-card">
            <h3>₺500M+</h3>
            <p>Dünya genelindeki ana endekslerin performansını takip edin.</p>
          </div>
          <div className="market-card">
            <h3>+1250 MUTLU YATIRIMCI</h3>
            <p>Bitcoin ve Ethereum gibi popüler kripto para birimlerinin anlık değerleri.</p>
          </div>
          <div className="market-card">
            <h3>%18.5 ORTALAMA YILLIK GELİR</h3>
            <p>Yerel ve uluslararası hisse senedi piyasalarındaki güncel durum.</p>
          </div>
          <div className="market-card">
            <h3>15 YIL</h3>
            <p>Yerel ve uluslararası hisse senedi piyasalarındaki güncel durum.</p>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="blog-section">
        <h2>Makaleler & Blog</h2>
        <div className="blog-grid">
          <div className="blog-card">
            <img src="/blog1.jpg" alt="Blog 1" className="blog-image" />
            <div className="blog-content">
              <h3>Ekonomide 2024 beklentileri: Enflasyon, borsa, faiz ne olur?</h3>
            </div>
          </div>

          <div className="blog-card">
            <img src="/blog2.jpg" alt="Blog 2" className="blog-image" />
            <div className="blog-content">
              <h3>Borsa yükselir mi? Dolar yılı kaça kapatır? Savaş ekonomiyi nasıl etkiler?</h3>
            </div>
          </div>

          <div className="blog-card">
            <img src="/blog3.jpg" alt="Blog 3" className="blog-image" />
            <div className="blog-content">
              <h3>Faiz yine artar mı? Tahvil almak için doğru zaman ne?</h3>
            </div>
          </div>
        </div>
      </section>

      
      {/* Scroll-to-top butonu */}
      <ScrollToTop />
      {/* Modals */}
    </div>
  );
};

export default LandingPage;
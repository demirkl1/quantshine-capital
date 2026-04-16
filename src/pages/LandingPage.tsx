import React from "react";
import MarketTicker from "../components/MarketTicker"; 
import MarketChart from "../components/MarketChart";
import NewsSection from '../components/NewsSection';
import "./LandingPage.css";

const LandingPage = () => {
  return (
    <div className="landing-page-container">
      {/* 1. ÜST BANT */}
      <div className="ticker-fixed-wrapper">
        <MarketTicker />
      </div>

      {/* 2. ANA ANİMASYON KATMANI */}
      <div className="main-hero-bg">
        <video autoPlay muted loop playsInline className="video-full-bg">
          <source src="/quantshine_animation.mp4" type="video/mp4" />
        </video>
        <div className="video-overlay-pro"></div>
      </div>

      {/* 3. İÇERİKLER */}
      <main className="main-content-scroll">
        <section className="hero-section">
          <div className="hero-foreground">
            <h1 className="hero-main-title">Geleceğin Finansına Hoş Geldiniz</h1>
            <p className="hero-sub-text">QuantShine Capital ile varlıklarınızı akıllıca yönetin.</p>
            
          </div>
        </section>

        {/* Grafik Paneli */}
        <section className="chart-split-section">
          <div className="chart-container-premium">
            <div className="chart-header-info">
              <div className="title-group">
                <h3>Piyasa Analiz Paneli</h3>
                <p className="chart-subtitle">Anlık portföy ve market verileri</p>
              </div>
              <div className="live-status">
                <span className="pulse-dot"></span>
                <span className="live-tag">CANLI VERİ AKIŞI</span>
              </div>
            </div>
            <div className="actual-chart-wrapper">
              <MarketChart />
            </div>
          </div>
        </section>

        {/* Özellik Grid Alanı */}
        <section className="social-proof-grid">
          <div className="grid-item">
            <div className="grid-icon-box">📈</div>
            <h4>Sürdürülebilir Getiri</h4>
            <p>Yıllık %18.5 ortalama performans ile varlıklarınızı güvenle büyütün.</p>
          </div>
          <div className="grid-item">
            <div className="grid-icon-box">🛡️</div>
            <h4>Yüksek Güvenlik</h4>
            <p>Uçtan uca şifreleme ve global standartlarda varlık koruma altyapısı.</p>
          </div>
          <div className="grid-item">
            <div className="grid-icon-box">👥</div>
            <h4>Uzman Portföy</h4>
            <p>1250+ bireysel ve kurumsal yatırımcıya özel stratejik yönetim.</p>
          </div>
          <div className="grid-item">
            <div className="grid-icon-box">⚡</div>
            <h4>Anlık İşlem</h4>
            <p>Hızlı, şeffaf ve her cihazdan erişilebilir portföy takip arayüzü.</p>
          </div>
        </section>

        {/* Canlı Haber Akışı */}
        <section className="landing-blog-section">
          <div className="blog-section-header">
            <h2 className="section-title">Piyasa Haberleri & Analizler</h2>
            <p className="section-subtitle">Hisse senetleri, emtia, döviz ve kripto piyasalarından anlık haber akışı.</p>
          </div>

          <div className="news-component-wrapper">
            <NewsSection />
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
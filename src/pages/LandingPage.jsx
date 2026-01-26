// src/pages/LandingPage.jsx
import React, { useEffect, useState } from "react";
import ScrollToTop from "../components/ScrollToTop";
import MarketTicker from "../components/MarketTicker"; // ✅ YENİ EKLENEN IMPORT
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import MarketChart from "../components/MarketChart"; // ✅ EKSİK OLAN SATIR BU
import NewsSection from '../components/NewsSection';

const LandingPage = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);

  // Haberleri API üzerinden çek
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(
          `https://newsapi.org/v2/top-headlines?country=tr&category=business&pageSize=5&apiKey=a0f3363405cf48d19e485ec786581640`
        );
        const data = await response.json();
        setNews(data.articles);
      } catch (error) {
        console.error("Haberler yüklenirken hata:", error);
      }
    };

    fetchNews();

    // Her gün otomatik güncelleme için interval
    const interval = setInterval(fetchNews, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleMoreInfoBireysel = () => navigate("/portfoy-bireysel");
  const handleMoreInfoKurumsal = () => navigate("/portfoy-kurumsal");

  return (
    <div className="landing-page-container">

      {/* ✅ YENİ EKLENEN: Borsa Bandı (Ticker) En Tepede */}
      <MarketTicker />

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
          <button className="btn secondary" onClick={handleMoreInfoBireysel}>
            Daha Fazla Bilgi
          </button>
        </div>
        <div className="about-card">
          <h3>Kurumsal Yatırımcılar</h3>
          <p>
            Sigorta şirketleri, emeklilik fonları, vakıflar, aile şirketleri, özel ve kamu şirketleri
            gibi kurumsal şirketler için kendi belirledikleri risk/getiri profillerine ve
            sınırlamalarına uygun portföyler oluşturuyoruz.
          </p>
          <button className="btn secondary" onClick={handleMoreInfoKurumsal}>
            Daha Fazla Bilgi
          </button>
        </div>
      </section>

      {/* Markets Section */}
      <section id="markets" className="markets-section">
        <div style={{ maxWidth: '800px', margin: '0 auto 40px auto' }}>
          <MarketChart symbol="USD" />
        </div>
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

      {/* Blog Section - Haberler */}
      <section id="blog" className="blog-section" style={{ padding: '40px 0' }}>
        {/* Başlığı ortalayıp biraz boşluk bırakalım */}
        <h2 style={{
          textAlign: 'center',
          color: '#f8fafc', // Beyaz tonu
          marginBottom: '30px',
          fontSize: '2rem'
        }}>
          Makaleler & Blog
        </h2>

        {/* Tüm mantığı artık bu bileşen hallediyor */}
        <NewsSection />

      </section>

      {/* Scroll-to-top butonu */}
      <ScrollToTop />
    </div>
  );
};

export default LandingPage;
import React from "react";
import "./InstitutionalInvestorPage.css";
import ScrollToTop from "../components/ScrollToTop";

export default function IndividualInvestorPage() {
  return (
    <div className="investor-container">
      {/* ÜST BAŞLIK ALANI - Kurumsal sayfa ile aynı dizayn */}
      <div className="page-header-section">
        <h1 className="page-main-title">BİREYSEL YATIRIMCILAR</h1>
        <div className="title-underline"></div>
        <p className="page-subtitle">Finansal vizyonumuzu ileriye taşımak için buradayız.</p>
      </div>

      <main className="investor-hero">
        <div className="investor-content">
          {/* Sol Kısım: Logo Kartı */}
          <div className="investor-media">
            <div className="logo-card">
              <img src="/quantshine_capital.png" alt="QuantShine Capital" />
            </div>
          </div>

          {/* Sağ Kısım: Yazı İçeriği */}
          <div className="investor-text-section">
            <h2 className="section-title">Finansal Geleceğinizi Yönetin</h2>
            <div className="investor-description">
              <p>
                <span className="brand-name">Quant&Shine Capital</span>, Bireysel Portföy Yönetimi hizmetimiz, Quantshine ile yatırımcı arasında imzalanan Bireysel Portföy Yönetimi Çerçeve Sözleşmesi kapsamında, belirli bir portföy büyüklüğüne sahip nitelikli yatırımcılara sunulmaktadır.
              </p>
              <p>
                Bu hizmet çerçevesinde, yatırımcılarımızın risk profili, finansal hedefleri ve getiri beklentileri detaylı şekilde analiz edilir. Yerindelik testi ve kapsamlı portföy değerlendirmesi sonrasında, yatırımcıya özel stratejik varlık dağılımı oluşturulur. Amacımız; her yatırımcının sermaye yapısına uygun, disiplinli ve sürdürülebilir bir yatırım planı geliştirmektir.
              </p>
              <p>
                Quantshine olarak yatırım kararlarımızı; makroekonomik analizler, piyasa verileri, algoritmik modeller ve risk yönetimi parametreleri doğrultusunda alıyoruz. Yerel ve küresel piyasalarda hisse senetleri, sabit getirili menkul kıymetler, yatırım fonları, türev araçlar, altın ve diğer emtia ürünleri dahil olmak üzere geniş bir varlık yelpazesinde yatırım imkânı sunuyoruz.
              </p>
              <p>
                Portföyler, yatırımcının risk toleransına uygun şekilde çeşitlendirilir; tek bir varlık sınıfına bağlı risk azaltılır ve küresel fırsatlardan dengeli biçimde yararlanılması hedeflenir. Opsiyon ve türev stratejilerle risk dengeleme mekanizmaları aktif olarak kullanılır.
              </p>
              <p>
                Profesyonel yönetim yaklaşımımız sayesinde, yatırımcıların çoğu zaman disiplinli şekilde uygulamakta zorlandığı kâr realizasyonu, zarar kesme ve risk azaltma süreçleri sistematik olarak yürütülür. Amaç; dalgalı piyasa koşullarında sermayeyi koruyarak uzun vadeli değer üretmektir.
              </p>
              <p>
                Bireysel Portföy Yönetimi hizmetimizden faydalanmak ve detaylı bilgi almak için bizimle iletişime geçebilirsiniz. Bu hizmetten yararlanabilmek için ilgili mevzuat kapsamında belirlenen nitelikli yatırımcı kriterlerinin sağlanması gerekmektedir.
              </p>
            </div>

            <div className="investor-tags">
              <span className="tag">RİSK YÖNETİMİ</span>
              <span className="tag">VARLIK KORUMA</span>
              <span className="tag">STRATEJİK PLANLAMA</span>
            </div>
          </div>
        </div>
      </main>

      <ScrollToTop />
    </div>
  );
}
import React from "react";
import "./InvidualInvestorPage.css";
import ScrollToTop from "../components/ScrollToTop";

export default function CorporateInvestorPage() {
  return (
    <div className="corporate-container">
      {/* Üst Başlık Bölümü */}
      <div className="page-header-section">
        <div className="header-content-box">
          <h1 className="header-title">KURUMSAL YATIRIMCILAR</h1>
          <div className="accent-line"></div>
          <p className="header-subtitle">
            Finansal vizyonumuzu ileriye taşımak için buradayız.
          </p>
        </div>
      </div>

      {/* Ana İçerik Bölümü */}
      <div className="corporate-content-section">
        <div className="corporate-wrapper">
          {/* Görsel Alanı */}
          <div className="corporate-media-box">
            <div className="glass-frame">
              <img
                src="/quantshine_capital.png"
                alt="QuantShine Capital Kurumsal"
              />
            </div>
          </div>

          {/* Metin Alanı */}
          <div className="corporate-text-box">
            <h2 className="content-heading">Stratejik Ortaklıklar ve Çözümler</h2>
            <p className="description-text">
              <strong>QuantShine Capital</strong>, Kurumsal Portföy Yönetimi hizmetimiz; aile şirketleri, özel ve kamu şirketleri, emeklilik fonları, sigorta şirketleri ve bilançosunda net nakit pozisyonu bulunan kurumlara yönelik olarak tasarlanmıştır. Her kurumun finansal yapısı, likidite ihtiyacı ve risk algısı farklıdır. Bu nedenle yatırım modellerimizi, kuruma özgü ihtiyaçları esas alarak yapılandırıyoruz.
            </p>
            <p className="description-text">
Quantshine olarak kurumsal müşterilerimizle uzun vadeli ve güven temelli ilişkiler kurmayı öncelikli görüyoruz. Amacımız yalnızca getiri sağlamak değil; sermayeyi koruyarak, kontrollü risk çerçevesinde istikrarlı büyüme elde etmektir.
            </p>
            <p className="description-text">
              Portföy stratejileri oluşturulurken; nakit akış projeksiyonları, bilanço yapısı, yükümlülük vadesi ve risk/getiri beklentileri detaylı şekilde analiz edilir. Bu analiz doğrultusunda dinamik varlık dağılımı modelleri oluşturulur ve piyasa koşullarına göre aktif olarak güncellenir. Butik hizmet anlayışımız ve etkin iletişim süreçlerimiz sayesinde hızlı karar alma ve uygulama esnekliği sağlıyoruz.
            </p>
            <p className="description-text">
              Yatırım evrenimiz; yerel ve küresel piyasalarda hisse senetleri, kamu ve özel sektör borçlanma araçları, Eurobond, yatırım fonları, emtia ürünleri, türev araçlar ve alternatif stratejileri kapsamaktadır. Risk profiline uygun olarak çeşitlendirilmiş portföy yapıları oluşturularak tek bir varlık sınıfına bağlı risk azaltılır ve sürdürülebilir performans hedeflenir.
            </p>
            <p className="description-text">
              Dalgalı ve kriz dönemlerinde ise disiplinli risk yönetimi yaklaşımımız, hedge ve dengeleme stratejilerimiz sayesinde portföyler etkin şekilde korunur.
            </p>
            <p className="description-text">
              Kurumsal Portföy Yönetimi hizmetimiz hakkında detaylı bilgi almak ve kurumunuza özel yatırım modeli oluşturmak için bizimle iletişime geçebilirsiniz. Bu hizmetten yararlanabilmek için ilgili mevzuat kapsamında belirlenen yatırımcı kriterlerinin sağlanması gerekmektedir.
            </p>
            
            <div className="corporate-features">
              <div className="feature-pill">Risk Yönetimi</div>
              <div className="feature-pill">Varlık Koruma</div>
              <div className="feature-pill">Stratejik Planlama</div>
            </div>
          </div>
        </div>
      </div>

      <ScrollToTop />
    </div>
  );
}
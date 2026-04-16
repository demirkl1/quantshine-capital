import React, { useState } from 'react';
import './Questions.css';
import ScrollToTop from "../components/ScrollToTop";

const FaqPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqData = [
    {
      question: "Paramı Quant&Shine Capital A.Ş'nin hesabına mı gönderiyorum?",
      answer: "Hayır. Quant&Shine Capital A.Ş.'nin anlaşmalı olduğu Türkiye İş Bankası A.Ş. veya Akbank takas saklama bankalarına müşteri adına açılan müşteri hesaplarına gönderilir ve yatırım yapılan finansal varlıklar müşteri adına takas saklama bankası tarafından saklanır."
    },
    {
      question: "Quant&Shine Capital A.Ş. paramı veya yatırımlarımı üçüncü şahıslara transfer edebilir mi?",
      answer: "Hayır. Müşteri varlıkları, müşterilerin kendi adlarına açılan saklama hesaplarında, Quant&Shine Capital A.Ş.'nin varlıklarından ayrı bir şekilde saklanır."
    },
    {
      question: "Quant&Shine Capital A.Ş. müşteri adına açılan hesap üzerinden istediği şekilde yatırım yapabilir mi?",
      answer: "Hayır. Quant&Shine Capital A.Ş. ancak yatırım fonu tüzüğünde belirtilen yatırım stratejileri doğrultusunda işlem yapabilir."
    },
    {
      question: "Yatırım fonu nedir?",
      answer: "Yatırım fonları, birden çok yatırımcının paralarının bir araya getirilerek profesyonel bir fon yöneticisi tarafından yönetildiği finansal enstrümanlardır."
    },
    {
      question: "Yatırım fonları hangi varlıklara yatırım yapabilir?",
      answer: "Yatırım fonları, hisse senetleri, tahvil, bono, altın, döviz gibi çeşitli finansal varlıklara yatırım yapabilir. Yatırım yapılacak varlıklar fonun tüzüğünde belirtilir."
    },
    {
      question: "Yatırım fonlarının avantajları nelerdir?",
      answer: "Profesyonel yönetim, riskin dağıtılması, düşük maliyetler, likidite ve şeffaflık gibi birçok avantaj sunar."
    },
    {
      question: "Yatırım fonları nasıl vergilendirilir?",
      answer: "Yatırım fonlarının vergilendirilmesi, fonun türüne ve mevcut vergi kanunlarına göre değişiklik gösterebilir. Güncel bilgi için bir mali müşavire danışmanız önerilir."
    }
  ];

  return (
    <div className="faq-page-container">
      <main className="faq-hero">
        <div className="faq-header-content">
          <h1 className="faq-main-title">Sıkça Sorulan Sorular</h1>
          <p className="faq-subtitle">QuantShine Capital hakkında merak ettiğiniz tüm soruların yanıtları.</p>
        </div>

        <div className="accordion-wrapper">
          {faqData.map((item, index) => (
            <div key={index} className={`faq-item ${openIndex === index ? 'active' : ''}`}>
              <button
                className="faq-question-btn"
                onClick={() => toggleAccordion(index)}
              >
                <span className="faq-question-text">{item.question}</span>
                <span className="faq-arrow-icon"></span>
              </button>
              <div className="faq-answer-container">
                <div className="faq-answer-content">
                  <p>{item.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <ScrollToTop />
    </div>
  );
};

export default FaqPage;
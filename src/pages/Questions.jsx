import React, { useState } from 'react';
import './Questions.css'; // CSS dosyanızın yolu
import ScrollToTop from "../components/ScrollToTop";


const FaqPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqData = [
    {
      question: "Paramı İstanbul Portföy Yönetimi A.Ş.'nin hesabına mı gönderiyorum?",
      answer: "Hayır. İstanbul Portföy Yönetimi A.Ş.'nin anlaşmalı olduğu Türkiye İş Bankası A.Ş. veya Akbank takas saklama bankalarına müşteri adına açılan müşteri hesaplarına gönderilir ve yatırım yapılan finansal varlıklar müşteri adına takas saklama bankası tarafından saklanır."
    },
    {
      question: "İstanbul Portföy Yönetimi A.Ş. paramı veya yatırımlarımı üçüncü şahıslara transfer edebilir mi?",
      answer: "Hayır. Müşteri varlıkları, müşterilerin kendi adlarına açılan saklama hesaplarında, İstanbul Portföy Yönetimi A.Ş.'nin varlıklarından ayrı bir şekilde saklanır."
    },
    {
      question: "İstanbul Portföy Yönetimi A.Ş. müşteri adına açılan hesap üzerinden istediği şekilde yatırım yapabilir mi?",
      answer: "Hayır. İstanbul Portföy Yönetimi A.Ş. ancak yatırım fonu tüzüğünde belirtilen yatırım stratejileri doğrultusunda işlem yapabilir."
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
      <section className="faq-section">
        <div className="faq-container">
          <h2>Sıkça Sorulan Sorular</h2>
          
          <div className="accordion">
            {faqData.map((item, index) => (
              <div key={index} className="accordion-item">
                <button
                  className={`accordion-header ${openIndex === index ? 'active' : ''}`}
                  onClick={() => toggleAccordion(index)}
                >
                  <span className="accordion-title">
                    {item.question}
                  </span>
                  <span className="accordion-icon"></span>
                </button>
                <div className={`accordion-content ${openIndex === index ? 'open' : ''}`}>
                  <p>{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <ScrollToTop />
    </div>
  );
};

export default FaqPage;
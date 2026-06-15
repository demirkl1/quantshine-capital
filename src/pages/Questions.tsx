import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, Plus, ArrowRight } from "lucide-react";
import Reveal from "../components/Reveal";
import ScrollToTop from "../components/ScrollToTop";
import Seo from "../components/Seo";
import "./Questions.css";

interface FaqItem {
  q: string;
  a: string;
}

const FaqPage: React.FC = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [query, setQuery] = useState("");

  const items = (t("faq.items", { returnObjects: true }) as FaqItem[]) || [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) => it.q.toLowerCase().includes(q) || it.a.toLowerCase().includes(q)
    );
  }, [items, query]);

  return (
    <div className="faq-page">
      <Seo title={t("faq.title")} description={t("faq.subtitle")} path="/sss" />
      {/* Hero */}
      <section className="faq-hero">
        <div className="faq-hero-bg" />
        <Reveal variant="up" className="faq-hero-inner">
          <h1 className="faq-title">{t("faq.title")}</h1>
          <div className="faq-underline" />
          <p className="faq-subtitle">{t("faq.subtitle")}</p>
          <div className="faq-search">
            <Search size={18} />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpenIndex(null);
              }}
              placeholder={t("faq.searchPlaceholder")}
            />
          </div>
        </Reveal>
      </section>

      {/* Akordeon */}
      <section className="faq-main">
        {filtered.length === 0 ? (
          <p className="faq-empty">{t("faq.empty")}</p>
        ) : (
          <div className="faq-list">
            {filtered.map((item, index) => (
              <Reveal
                key={item.q}
                variant="up"
                delay={(index % 6) * 60}
                className={`faq-item ${openIndex === index ? "active" : ""}`}
              >
                <button
                  className="faq-question"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span>{item.q}</span>
                  <span className="faq-icon">
                    <Plus size={20} />
                  </span>
                </button>
                <div className="faq-answer">
                  <div className="faq-answer-inner">
                    <p>{item.a}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        {/* CTA */}
        <Reveal variant="up" className="faq-cta">
          <h2>{t("faq.ctaTitle")}</h2>
          <p>{t("faq.ctaText")}</p>
          <Link to="/iletisim" className="cta-button">
            {t("faq.ctaBtn")} <ArrowRight size={18} />
          </Link>
        </Reveal>
      </section>

      <ScrollToTop />
    </div>
  );
};

export default FaqPage;

import React, { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import Reveal from "../components/Reveal";
import ScrollToTop from "../components/ScrollToTop";
import Seo from "../components/Seo";
import api from "../api";
import "./Iletisim.css";

const Iletisim: React.FC = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);

  const INFO = [
    {
      icon: MapPin,
      title: t("contact.addressTitle"),
      lines: [t("contact.addressLine1"), t("contact.addressLine2")],
    },
    {
      icon: Phone,
      title: t("contact.phoneTitle"),
      lines: ["+90 123 456 78 90"],
      href: "tel:+901234567890",
    },
    {
      icon: Mail,
      title: t("contact.emailTitle"),
      lines: ["manager@quantshinecapital.com"],
      href: "mailto:manager@quantshinecapital.com",
    },
    {
      icon: Clock,
      title: t("contact.hoursTitle"),
      lines: [t("contact.hoursLine1"), t("contact.hoursLine2")],
    },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error(t("contact.errorMsg"));
      return;
    }
    setSending(true);
    try {
      await api.post("/contact", form);
      toast.success(t("contact.successMsg"));
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      toast.error(t("contact.errorMsg"));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="contact-container">
      <Seo title={t("contact.title")} description={t("contact.subtitle")} path="/iletisim" />
      {/* Başlık */}
      <div className="contact-title-section">
        <Reveal variant="up">
          <h1 className="contact-title">{t("contact.title")}</h1>
          <div className="contact-underline" />
          <p className="contact-subtitle">{t("contact.subtitle")}</p>
        </Reveal>
      </div>

      <div className="contact-main">
        {/* Bilgi kartları */}
        <div className="contact-info-grid">
          {INFO.map((item, i) => {
            const Inner = (
              <>
                <div className="contact-info-icon">
                  <item.icon size={24} strokeWidth={2} />
                </div>
                <div>
                  <h4>{item.title}</h4>
                  {item.lines.map((l) => (
                    <p key={l}>{l}</p>
                  ))}
                </div>
              </>
            );
            return (
              <Reveal key={item.title} variant="up" delay={i * 90} className="contact-info-card">
                {item.href ? (
                  <a href={item.href} className="contact-info-link">
                    {Inner}
                  </a>
                ) : (
                  Inner
                )}
              </Reveal>
            );
          })}
        </div>

        {/* Form + harita */}
        <div className="contact-body">
          <Reveal variant="left" className="contact-form-wrap">
            <h2>{t("contact.formTitle")}</h2>
            <p className="contact-form-sub">{t("contact.formSub")}</p>
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="contact-field-row">
                <div className="contact-field">
                  <label>{t("contact.name")} *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder={t("contact.namePlaceholder")}
                  />
                </div>
                <div className="contact-field">
                  <label>{t("contact.phone")}</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+90 5XX XXX XX XX"
                  />
                </div>
              </div>
              <div className="contact-field">
                <label>{t("contact.emailLabel")} *</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="ornek@mail.com"
                />
              </div>
              <div className="contact-field">
                <label>{t("contact.message")} *</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder={t("contact.messagePlaceholder")}
                />
              </div>
              <button type="submit" className="contact-submit" disabled={sending}>
                {t("contact.send")} <Send size={18} />
              </button>
            </form>
          </Reveal>

          <Reveal variant="right" delay={120} className="contact-map-wrap">
            <iframe
              title="QuantShine Capital Konum"
              src="https://maps.google.com/maps?q=Levent%2C%20Be%C5%9Fikta%C5%9F%2C%20%C4%B0stanbul&t=&z=14&ie=UTF8&iwloc=&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Reveal>
        </div>
      </div>

      <ScrollToTop />
    </div>
  );
};

export default Iletisim;

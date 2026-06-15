import React, { useState } from "react";
import toast from "react-hot-toast";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import Reveal from "../components/Reveal";
import ScrollToTop from "../components/ScrollToTop";
import "./Iletisim.css";

const INFO = [
  {
    icon: MapPin,
    title: "Adres",
    lines: ["Büyükdere Cad. No:1, Levent", "34330 Beşiktaş / İstanbul"],
  },
  {
    icon: Phone,
    title: "Telefon",
    lines: ["+90 123 456 78 90"],
    href: "tel:+901234567890",
  },
  {
    icon: Mail,
    title: "E-posta",
    lines: ["manager@quantshinecapital.com"],
    href: "mailto:manager@quantshinecapital.com",
  },
  {
    icon: Clock,
    title: "Çalışma Saatleri",
    lines: ["Pazartesi – Cuma", "09:00 – 18:00"],
  },
];

const Iletisim: React.FC = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Lütfen zorunlu alanları doldurun.");
      return;
    }
    toast.success("Mesajınız alındı. En kısa sürede size dönüş yapacağız.");
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="contact-container">
      {/* Başlık */}
      <div className="contact-title-section">
        <Reveal variant="up">
          <h1 className="contact-title">İLETİŞİM</h1>
          <div className="contact-underline" />
          <p className="contact-subtitle">
            Sorularınız ve portföy yönetimi başvurularınız için bize ulaşın.
          </p>
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
            <h2>Bize Mesaj Gönderin</h2>
            <p className="contact-form-sub">
              Formu doldurun, uzman ekibimiz en kısa sürede sizinle iletişime
              geçsin.
            </p>
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="contact-field-row">
                <div className="contact-field">
                  <label>Ad Soyad *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Adınız Soyadınız"
                  />
                </div>
                <div className="contact-field">
                  <label>Telefon</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+90 5XX XXX XX XX"
                  />
                </div>
              </div>
              <div className="contact-field">
                <label>E-posta *</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="ornek@mail.com"
                />
              </div>
              <div className="contact-field">
                <label>Mesajınız *</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Mesajınızı yazın..."
                />
              </div>
              <button type="submit" className="contact-submit">
                Gönder <Send size={18} />
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

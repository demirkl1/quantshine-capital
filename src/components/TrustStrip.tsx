import React from "react";
import { useTranslation } from "react-i18next";
import { ShieldCheck, Landmark, BadgeCheck, BarChart3 } from "lucide-react";
import Reveal from "./Reveal";
import "./TrustStrip.css";

/**
 * Güven / sosyal kanıt şeridi — portföy şirketi için kritik dönüşüm sinyali.
 * Lisans, saklama, denetim ve üyelik rozetleri.
 */
const TrustStrip: React.FC = () => {
  const { t } = useTranslation();

  const ITEMS = [
    { icon: ShieldCheck, label: t("trust.item1") },
    { icon: Landmark, label: t("trust.item2") },
    { icon: BadgeCheck, label: t("trust.item3") },
    { icon: BarChart3, label: t("trust.item4") },
  ];

  return (
    <section className="trust-strip-section">
      <Reveal variant="up" className="trust-strip-head">
        <h2 className="section-title">{t("trust.title")}</h2>
        <p className="section-subtitle">{t("trust.subtitle")}</p>
      </Reveal>

      <div className="trust-strip">
        {ITEMS.map((item, i) => (
          <Reveal key={item.label} variant="up" delay={i * 90} className="trust-item">
            <span className="trust-item-icon">
              <item.icon size={22} strokeWidth={2} />
            </span>
            <span className="trust-item-label">{item.label}</span>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default TrustStrip;

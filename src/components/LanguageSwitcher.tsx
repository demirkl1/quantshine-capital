import React from "react";
import { useTranslation } from "react-i18next";
import "./LanguageSwitcher.css";

const LANGS = [
  { code: "tr", label: "TR" },
  { code: "en", label: "EN" },
];

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith("en") ? "en" : "tr";

  return (
    <div className="lang-switcher" role="group" aria-label="Language">
      {LANGS.map((l) => (
        <button
          key={l.code}
          className={`lang-btn ${current === l.code ? "active" : ""}`}
          onClick={() => i18n.changeLanguage(l.code)}
          aria-pressed={current === l.code}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;

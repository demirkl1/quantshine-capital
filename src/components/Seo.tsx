import React from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

interface SeoProps {
  title: string;
  description?: string;
  path?: string;
}

const BRAND = "QuantShine Capital";
const ORIGIN = "https://quant-shine.com";

const Seo: React.FC<SeoProps> = ({ title, description, path }) => {
  const { i18n } = useTranslation();
  const fullTitle = title ? `${title} | ${BRAND}` : BRAND;
  const lang = i18n.language?.startsWith("en") ? "en" : "tr";
  const url = path ? `${ORIGIN}${path}` : undefined;

  return (
    <Helmet>
      <html lang={lang} />
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {url && <link rel="canonical" href={url} />}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      {url && <meta property="og:url" content={url} />}
      <meta property="og:locale" content={lang === "en" ? "en_US" : "tr_TR"} />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
    </Helmet>
  );
};

export default Seo;

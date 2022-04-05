import i18n from "i18next";
import Backend from "i18next-fs-backend";
import { LanguageDetector } from "i18next-http-middleware";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .init({
    whitelist: ["en", "de", "fr", "tr"],
    fallbackLng: ["en"],
    debug: false,
    ns: ["translation"],
    defaultNS: "translation",
    // detection: {
    //   // cookieDomain: "solsea.io"
    //   order: ["subdomain"]
    // },
    interpolation: {
      escapeValue: false
    },
    preload: ["en", "de", "fr", "tr"],
    backend: {
      loadPath: "public/locales/{{lng}}/translation.json",
      jsonIndent: 2
    }
  });

export default i18n;

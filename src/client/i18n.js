import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpApi from "i18next-http-backend";
import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
// import EnglishTranslation from "../../public/translations/English/english.json";
// import FrenchTranslation from "../../public/translations/French/french.json";
// import Backend from "i18next-http-backend";

// const fallbackLng = code => {
//   if (!code) return ["en"];
//   const lang = code.split("-")[0];
//   return [lang];
// };
const availableLanguages = ["en", "fr", "de"];

// const resources = {
//   en: {
//     translation: EnglishTranslation
//   },
//   fr: {
//     translation: FrenchTranslation
//   }
// };

i18n
  .use(HttpApi)
  .use(I18nextBrowserLanguageDetector)
  .init({
    // resources,
    whitelist: availableLanguages,
    fallbackLng: ["en"],

    debug: false,

    ns: ["translation"],
    defaultNS: "translation",
    nonExplicitSupportedLngs: true,

    detection: {
      // cookieDomain: "solsea.io",
      order: ["subdomain"]
      // caches: ["cookie"],
      // cookieMinutes: 36000,
      // cookieOptions: {
      //   path: "/",
      //   domain: "solsea.io"
      // }
    },

    backend: {
      backendOptions: [
        {
          loadPath: "/locales/en/translation.json"
        },
        {
          loadPath: "/locales/de/translation.json"
        },
        {
          loadPath: "/locales/fr/translation.json"
        }
      ]
    },

    // useLocalStorage: true,

    // useDataAttrOptions: true,

    interpolation: {
      escapeValue: false
    },
    react: {
      wait: true,
      useSuspense: false
    }
  });

export default i18n;

export function getLanguageRootUrl(lang) {
  if (!process.env.APP_ENV || process.env.APP_ENV === "development") return "";
  return links[lang][process.env.APP_ENV] || "";
}

const links = {
  en: {
    staging: "https://stejdzing.solsea.io",
    production: "https://solsea.io"
  },
  de: {
    staging: "https://stejdzing-de.solsea.io",
    production: "https://de.solsea.io"
  },
  tr: {
    staging: "https://stejdzing-tr.solsea.io",
    production: "https://tr.solsea.io"
  }
};

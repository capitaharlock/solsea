import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import s from "./LanguageSelector.scss";
import useStyles from "isomorphic-style-loader/useStyles";
import { useHistory } from "react-router";
import { getLanguageRootUrl } from "../../../api/getLanguageUrl";

const languageMap = {
  en: {
    label: "English",
    img: "/assets/us.svg",
    dir: "ltr",
    active: true
    // link: "https://stejdzing.solsea.io"
  },
  de: {
    label: "Deutsch",
    img: "/assets/de.svg",
    dir: "ltr",
    active: false
    // link: "https://stejdzing-de.solsea.io"
  },
  tr: {
    label: "Türkçe",
    img: "/assets/tr.svg",
    dir: "ltr",
    active: false
    // link: "https://stejdzing-tr.solsea.io"
  }
};

const LanguageSelector = () => {
  const history = useHistory();
  const { i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(
    languageMap[i18n.language] || languageMap.en
  );

  useStyles(s);
  return (
    <div className={`dropdown ${s.dropdown}`}>
      <button
        className={`dropdown-toggle ${s.languageSelect}`}
        type="button"
        id="dropdownMenuButton"
        aria-haspopup="true"
        aria-expanded="false"
      >
        <img src={selectedLanguage.img} />
      </button>
      <div
        className={`dropdown-menu ${s.buttonSelect}`}
        aria-labelledby="dropdownMenuButton"
      >
        {Object.keys(languageMap).map(item => {
          const root = getLanguageRootUrl(item);
          return (
            <div
              key={item}
              onClick={e => {
                if (!root) {
                  e.preventDefault();
                }
                i18next.changeLanguage(item);
                setSelectedLanguage(languageMap[item]);
              }}
            >
              <a href={root + history.location.pathname}>
                <div>
                  <img src={languageMap[item].img} />
                  <span>{languageMap[item].label}</span>
                </div>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LanguageSelector;

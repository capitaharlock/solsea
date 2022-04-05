import useStyles from "isomorphic-style-loader/useStyles";
import React from "react";
import { useTranslation } from "react-i18next";
import s from "./BelowTheFold.scss";

const BelowTheFold = () => {
  const { t } = useTranslation();
  useStyles(s);

  return (
    <div className={`${s.lineItems} d-flex container`}>
      <div className={`${s.lineItem} col-lg-3`}>
        <i className={`${s.checkIcon} fa fa-check me-1`}></i>
        <div className={s.lineSectionText}>
          <h2>{t("homepage.firstCheckmark")}</h2>
          <p>{t("homepage.textWithFirstCheckmark")}</p>
        </div>
      </div>
      <div className={`${s.lineItem} col-lg-3`}>
        <i className={`${s.checkIcon} fa fa-check me-1`}></i>
        <div className={s.lineSectionText}>
          <h2>{t("homepage.secondCheckmark")}</h2>
          <p>{t("homepage.textWithSecondCheckmark")}</p>
        </div>
      </div>
      <div className={`${s.lineItem} col-lg-3`}>
        <i className={`${s.checkIcon} fa fa-check me-1`}></i>
        <div className={s.lineSectionText}>
          <h2>{t("homepage.thirdCheckmark")}</h2>
          <p>{t("homepage.textWithThirdCheckmark")}</p>
        </div>
      </div>
      <div className={`${s.lineItem} col-lg-3`}>
        <i className={`${s.checkIcon} fa fa-check me-1`}></i>
        <div className={s.lineSectionText}>
          <h2>{t("homepage.fourthCheckmark")}</h2>
          <p>{t("homepage.textWithFourthCheckmark")}</p>
        </div>
      </div>
    </div>
  );
};

export default BelowTheFold;

import useStyles from "isomorphic-style-loader/useStyles";
import React from "react";
import s from "./TraitHolder.scss";
import { parseNFTPrice } from "../../hooks/parsePrice";
import { SystemProgram } from "@solana/web3.js";
import ReactTooltip from "react-tooltip";
import { useTranslation } from "react-i18next";

const systemProgramAddress = SystemProgram.programId.toString();

const TraitHolder = ({ trait, selected, onTraitSelect }) => {
  const { t } = useTranslation();
  useStyles(s);
  return (
    <>
      <button
        onClick={e => {
          onTraitSelect(trait);
        }}
        key={trait.value}
        // Ne pitajte zasto id, Djura je
        className={`${s.traitBtn} ${selected ? s.selectedTrait : ""}`}
      >
        <div className={`${s.traitLabel}`}>
          <span>{trait.type}</span>
          {trait && trait.percentage ? (
            <span data-tip={t("trait.toolTipPercentage")}>
              {trait.hasOwnProperty("percentage") &&
                ` (${trait.percentage.toFixed(2)}%)`}
            </span>
          ) : null}
          {
            <ul className={`${s.statsContainer}`}>
              <li data-tip={t("trait.toolTip1")}>
                {trait.hasOwnProperty("listed") && trait.listed > 0
                  ? trait.listed
                  : 0}
              </li>
              <li data-tip={t("trait.toolTip2")}>{trait.count}</li>
              <li data-tip={t("trait.toolTip3")}>
                {trait.hasOwnProperty("median")
                  ? parseNFTPrice(trait.median, systemProgramAddress).price
                  : "-"}
              </li>
              <li data-tip={t("trait.toolTip5")}>
                {trait.hasOwnProperty("volume")
                  ? parseNFTPrice(trait.volume, systemProgramAddress).price
                  : "-"}
              </li>
              <li data-tip={t("trait.toolTip4")}>
                {trait.hasOwnProperty("floor")
                  ? parseNFTPrice(trait.floor, systemProgramAddress).price
                  : "-"}
              </li>
            </ul>
          }
        </div>
        <ReactTooltip
          place="top"
          effect="solid"
          multiline={true}
          className={`tool-tip`}
        />
      </button>
    </>
  );
};

export default TraitHolder;

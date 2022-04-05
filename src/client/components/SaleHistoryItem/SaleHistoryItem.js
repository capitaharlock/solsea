import useStyles from "isomorphic-style-loader/useStyles";
import withStyles from "isomorphic-style-loader/withStyles";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { parseNFTPrice } from "../../hooks/parsePrice";
import { useFilePath } from "../../hooks/useFilePath";
import s from "./SaleHistoryItem.scss";
import { useTranslation } from "react-i18next";

const SaleHistoryItem = props => {
  const {
    Title,
    Preview_URL,
    price,
    Mint,
    rarity_score,
    rarity_rank,
    verified,
    className = "",
    nft_collection,
    currency,
    createdAt,
    sellerKey,
    buyerKey,
    files
  } = props;

  const nftUrl = "/nft/" + Mint;
  const { t } = useTranslation();
  const { isDarkMode } = useSelector(({ app }) => ({
    isDarkMode: app.isDarkMode
  }));

  const parsedCurrency = useMemo(() => {
    if (currency) {
      return parseNFTPrice(price, currency);
    }

    return "";
  }, [currency]);

  const { path: imagePath } = useFilePath({
    destination: files && files.s3 && files.s3.thumbnail
  });

  useStyles(s);
  return (
    <div
      className={`${s.salesItem} ${verified ? s.verified : ""} d-flex ${
        className && className !== "" ? className : ""
      }`}
    >
      <Link className={s.imgHolder} to={nftUrl}>
        {verified ? (
          <div className={s.iconTitleContainer}>
            <i className={`${s.iconTitle} fa fa-check-circle`}></i>
          </div>
        ) : null}
        <img
          src={!imagePath ? Preview_URL : imagePath}
          className={s.salesItemPreview}
          alt="Sales Item"
        />
      </Link>
      <div className={`${s.infoHolder} d-flex`}>
        <div
          className={`${s.salesItemHeader} ${
            isDarkMode ? "dark-nft-border-bottom" : ""
          }`}
        >
          <Link to={nftUrl} className={s.titleSales}>
            {Title}
          </Link>
          {nft_collection && (
            <Link
              className={`${s.salesItemCollection} d-flex`}
              to={`/collection/${nft_collection._id}`}
            >
              {nft_collection.verified ? (
                <i className={`${s.icon} fa fa-check-circle me-1`}></i>
              ) : null}
              <h5>{nft_collection.title}</h5>
            </Link>
          )}
        </div>
        <div className={`${s.salesItemInfo} d-flex`}>
          <div className={`${s.salesItemPrice} d-flex`}>
            <div className={s.priceContainer}>
              {parsedCurrency ? (
                <>
                  {parsedCurrency.price} {parsedCurrency.currency}
                </>
              ) : (
                t("nftItem.notListedItem")
              )}
            </div>
            <div className={s.rarity}>
              {rarity_rank ? (
                <>
                  <span className={s.rank}>{rarity_rank}</span>
                  {/* <span className={s.rank}>2525</span> */}
                  {isDarkMode ? (
                    <img
                      className={`${s.rankIcon}`}
                      src="/assets/rank_dark.svg"
                    />
                  ) : (
                    <img className={`${s.rankIcon}`} src="/assets/rank.svg" />
                  )}
                </>
              ) : (
                rarity_score && (
                  <>
                    <span className={s.stars}>{rarity_score.toFixed(2)}</span>
                    {/* <span className={s.stars}>2525</span> */}
                    <i className={`${s.starsIcon} fa fa-star-o me-1`}></i>
                  </>
                )
              )}
            </div>
          </div>
          <div className={s.transactionInfo}>
            <p className={s.date}>{new Date(createdAt).toUTCString()}</p>
            <div className={s.transactionHolder}>
              <p className={s.seller}>
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={"https://explorer.solana.com/address/" + sellerKey}
                  className={s.walletKey}
                >
                  {sellerKey}
                </a>
              </p>
              <i className={`fa fa-arrow-right`}></i>
              <p className={s.seller}>
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={"https://explorer.solana.com/address/" + buyerKey}
                  className={s.walletKey}
                >
                  {buyerKey}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withStyles(s)(SaleHistoryItem);

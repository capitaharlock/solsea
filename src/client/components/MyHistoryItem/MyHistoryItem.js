import useStyles from "isomorphic-style-loader/useStyles";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { parseNFTPrice } from "../../hooks/parsePrice";
import { useFilePath } from "../../hooks/useFilePath";
import s from "./MyHistoryItem.scss";
import { useTranslation } from "react-i18next";

const MyHistoryItem = ({
  Mint,
  image,
  Preview_URL,
  Title,
  sellerKey,
  buyerKey,
  createdAt,
  price,
  currency,
  status
}) => {
  const { isDarkMode } = useSelector(({ app }) => ({
    isDarkMode: app.isDarkMode
  }));
  
  useStyles(s);
  const { t } = useTranslation();

  const { walletKey } = useSelector(({ user }) => ({
    walletKey: user.walletKey
  }));

  const { path: imagePath } = useFilePath({
    destination: image && image.s3 && image.s3.thumbnail
  });

  const priceItem = useMemo(() => {
    if (price && currency) {
      return parseNFTPrice(price, currency);
    }

    return "";
  }, [price && currency]);

  return (
    <div
      className={`${s.nftItem} ${isDarkMode ? "dark-nft-item" : "light-white"}`}
    >
      <div className={`${s.nftItemInner} d-flex`}>
        <Link to={`/nft/${Mint}`}>
          <img src={!imagePath ? Preview_URL : imagePath} alt="" />
        </Link>
        <div className={s.content}>
          <h6>{Title}</h6>
          {status === "SOLD" && (
            <>
              {sellerKey === walletKey.toString() && (
                <p>
                  <span>{t("myHistoryItem.soldFor")}</span>
                  {priceItem.price} {priceItem.currency}
                </p>
              )}
              {buyerKey === walletKey.toString() && (
                <p>
                  <span>
                    <strong>{t("myHistoryItem.boughtFor")}</strong>
                  </span>
                  {priceItem.price} {priceItem.currency}
                </p>
              )}
            </>
          )}
          <p className={s.seller}>
            <span>
              <strong>{t("myHistoryItem.seller")}</strong>
            </span>
            <a
              target="_blank"
              rel="noreferrer"
              href={"https://explorer.solana.com/address/" + sellerKey}
            >
              {sellerKey}
            </a>
          </p>
          <p className={s.seller}>
            <span>
              <strong>{t("myHistoryItem.buyerItem")}</strong>
            </span>
            <a
              target="_blank"
              rel="noreferrer"
              href={"https://explorer.solana.com/address/" + buyerKey}
            >
              {buyerKey}
            </a>
          </p>

          <p className={s.seller}>
            <span>
              <strong>{t("myHistoryItem.date")}</strong>
            </span>
            {new Date(createdAt).toUTCString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyHistoryItem;

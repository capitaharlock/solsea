import { SystemProgram } from "@solana/web3.js";
import useStyles from "isomorphic-style-loader/useStyles";
import React, { useMemo } from "react";
import { store } from "react-notifications-component";
import { Link } from "react-router-dom";
import { notificationOptions } from "../../../api/Definitions";
import { parseNFTPrice } from "../../hooks/parsePrice";
import { useFilePath } from "../../hooks/useFilePath";
import s from "./CollectionItem.scss";
import { useTranslation } from "react-i18next";

const CollectionItem = ({
  title,
  _id,
  minted,
  iconImage,
  headerImage,
  nftCount,
  floorPrice,
  mintedDate,
  displayDate,
  verified,
  liked,
  views
}) => {
  const { t } = useTranslation();

  const { path: iconImagePath } = useFilePath({
    destination: iconImage && iconImage.s3 && iconImage.s3.thumbnail
  });

  const { path: headerImagePath } = useFilePath({
    destination: headerImage && headerImage.s3 && headerImage.s3.thumbnail
  });

  let formatDate = undefined;
  if (mintedDate) {
    const date = new Date(mintedDate);
    formatDate = `${date.getDate()}.${date.getMonth() +
      1}.${date.getUTCFullYear()}`;
  }

  const itemFloorPrice = useMemo(() => {
    if (floorPrice && floorPrice > 0) {
      return parseNFTPrice(floorPrice, SystemProgram.programId.toString());
    }
    return {};
  }, [floorPrice]);

  const onClickLike = () => {
    store.addNotification({
      message: t("collectionItem.errorMessage"),
      type: "warning",
      ...notificationOptions
    });
  };
  useStyles(s);
  return (
    <div
      id={"collection-carousel-alt"}
      className={`${s.collection} wow fadeIn`}
    >
      <div className={`${s.nftColl} ${s.style2} ${verified ? s.verified : ""}`}>
        <div className={`${s.nftWrap}`}>
          <Link to={"/collection/" + _id}>
            <img
              src={
                headerImagePath
                  ? headerImagePath
                  : "/assets/no_collection_background.jpg"
              }
              className={`lazy ${s.imgFluid}`}
              alt=""
            />
          </Link>
          <div className={s.nftCollPp}>
            <img
              className={"lazy"}
              src={
                iconImagePath ? iconImagePath : "/assets/no_collection_icon.jpg"
              }
              alt=""
            />
          </div>
        </div>
        <div className={s.nftCollInfo}>
          <Link to={"/collection/" + _id}>
            <h4>{title}</h4>
            {verified && (
              <i className={`${s.starsIcon} fa fa-check-circle me-1`}></i>
            )}
          </Link>
          {verified ? (
            <span className={`${s.verifiedCollection}`}>
              {t("collections.verifiedCollection")}
            </span>
          ) : (
            <span className={s.unverifiedCollection}>
              {t("collections.unverifiedCollection")}
            </span>
          )}
          <div className={s.collectionListedFloor}>
            <div className={s.listedFloor}>
              <h6>
                {t("collectionItem.listedItem")}
                <span>{nftCount ? nftCount : "0"}</span>
              </h6>
              <h6>
                {t("collectionItem.floorItem")}
                <span>
                  {itemFloorPrice.price ? itemFloorPrice.price : "0"}{" "}
                </span>
                <span>
                  {itemFloorPrice.currency ? itemFloorPrice.currency : ""}
                </span>
              </h6>
            </div>
            <div className={s.likeView}>
              <h6 onClick={onClickLike}>
                {/* {t("collectionItem.likedItem")} */}
                <span>{liked ? liked : "0"}</span>{" "}
                <i className={`fa fa-heart-o me-1 ${s.heart}`}></i>
              </h6>
              <h6>
                {/* {t("collectionItem.viewsItem")} */}
                <span>{views ? views : "0"}</span>{" "}
                <i className={`fa fa-eye me-1`}></i>
              </h6>
            </div>
          </div>
          {displayDate && mintedDate && (
            <h6>
              {t("calendarItem.comingOn")}
              {formatDate}
            </h6>
          )}
          {minted}
        </div>
      </div>
    </div>
  );
};

export default CollectionItem;

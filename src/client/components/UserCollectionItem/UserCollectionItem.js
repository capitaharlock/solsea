import useStyles from "isomorphic-style-loader/useStyles";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useHistory, useRouteMatch } from "react-router";
import {
  handleHideCollection,
  handleShowCollection
} from "../../actions/collections";
// import { API_URL } from "../../../api/Definitions";
import { useFilePath } from "../../hooks/useFilePath";
import s from "./UserCollectionItem.scss";
import { SET_COLLECTION_FOR_VALIDATION } from "../../actions/app";
import { useTranslation } from "react-i18next";

const UserCollectionItem = ({
  title,
  _id,
  standard,
  iconImage,
  submitedForValidation,
  headerImage,
  nftCount,
  verified,
  floor,
  mintedDate,
  floorPrice,
  visible,
  displayDate
}) => {
  const { isDarkMode } = useSelector(({ app }) => ({
    isDarkMode: app.isDarkMode
  }));
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

  const delistCollection = async () => {
    if (confirm(t("userCollectionItem.areYouSureUnpublish"))) {
      handleHideCollection(_id);
    }
  };

  const listCollection = async () => {
    if (confirm(t("userCollectionItem.areYouSurePublish"))) {
      handleShowCollection(_id);
    }
  };

  const dispatch = useDispatch();
  const history = useHistory();

  const onCollectionValSelection = async () => {
    dispatch({
      type: SET_COLLECTION_FOR_VALIDATION,
      value: _id
    });
    history.push("/collection-verification");
  };

  useStyles(s);
  return (
    <div
      id={"collection-carousel-alt"}
      className={`${s.collection} wow fadeIn`}
    >
      <div
        className={`${s.nftColl} ${s.style2} ${
          isDarkMode ? "dark-user-collection-item" : "light"
        }`}
      >
        <div className={`${s.nftWrap}`}>
          <Link to={"/collection/" + _id}>
            <img
              src={headerImagePath}
              className={`lazy ${s.imgFluid}`}
              alt=""
            />
          </Link>
          <div className={s.nftCollPp}>
            <img className={"lazy"} src={iconImagePath} alt="" />
          </div>
        </div>
        <div className={s.nftCollInfo}>
          <Link to={"/collection/" + _id}>
            <h4>{title}</h4>
            {verified && (
              <i
                className={`${s.starsIcon} ${
                  isDarkMode ? "dark-verified-badge-color" : ""
                } fa fa-check-circle me-1`}
              ></i>
            )}
          </Link>
          <div className={s.collectionListedFloor}>
            <h6>
              {t("collectionItem.listedItem")}
              {nftCount ? nftCount : "0"}
            </h6>
            {floor && floor > 0 && (
              <h6>
                {t("collectionItem.floorItem")}
                {floorPrice ? floorPrice : "0"}*
              </h6>
            )}
          </div>
          <div className={`${s.nftItemAction}`}>
            <div
              className={`${s.listButton} ${
                isDarkMode ? "dark-letter-font" : ""
              } mb-3`}
            >
              {visible ? (
                <span
                  onClick={delistCollection}
                  className={`${s.nftListing} ${s.delist}`}
                >
                  {t("userCollectionItem.unpublish")}
                </span>
              ) : (
                <span
                  onClick={listCollection}
                  className={`${s.nftListing} ${s.list}`}
                >
                  {t("userCollectionItem.publish")}
                </span>
              )}
            </div>
          </div>
          <div className={`${s.collectionButtons} d-flex`}>
            <div>
              <Link
                className={`${s.nftListing} ${s.list} ${
                  isDarkMode ? "dark-lighter-edit-collection" : "light"
                }`}
                to={"/edit-collection/" + _id}
              >
                {t("userCollectionItem.editCollection")}
              </Link>
            </div>
            {!submitedForValidation && (
              <div>
                <button
                  className={`${s.nftListing} ${s.delist} ${
                    isDarkMode ? "dark-lighter-edit-collection" : "light"
                  }`}
                  onClick={onCollectionValSelection}
                >
                  {t("userCollectionItem.verifyCollection")}
                </button>
              </div>
            )}
          </div>
          {displayDate && mintedDate && (
            <h6>
              {t("calendarItem.comingOn")}
              {formatDate}
            </h6>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCollectionItem;

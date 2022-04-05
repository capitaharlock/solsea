import React, { useMemo } from "react";
import { useFilePath } from "../../../hooks/useFilePath";
import client from "../../../services/feathers";
import s from "./CollectionHeader.scss";
import { useDispatch, useSelector } from "react-redux";
import CollectionPageFilters from "../CollectionPageFilters";
import { Parallax } from "react-parallax";
import { parseUrl } from "../../../hooks/parseUrl";
import { Link } from "react-router-dom";
import ReadMore from "../../../components/ReadMore/ReadMore";
import { store } from "react-notifications-component";
import { notificationOptions } from "../../../../api/Definitions";
import {
  reloadCollectionLikes,
  reloadCollectionReports
} from "../../../actions/user";
import { errorNotification } from "../../../helpers/nofiticationsFunction";
import { useTranslation } from "react-i18next";
import useStyles from "isomorphic-style-loader/useStyles";
import { parseNFTPrice } from "../../../hooks/parsePrice";
import { SystemProgram } from "@solana/web3.js";

const CollectionHeader = ({
  likes,
  query,
  setQuery,
  setLikes,
  headerImage
}) => {
  const { t } = useTranslation();

  const {
    collectionPage = {},
    licenses,
    isDarkMode,
    user,
    tags,
    app
  } = useSelector(
    ({
      collections,
      nfts,
      traits,
      listedLicenses,
      user,
      tags,
      app,
      saleshistory
    }) => ({
      collectionPage: collections.collectionPage,
      collectionNfts: nfts.collectionNfts,
      collectionNftsCount: nfts.collectionNftsCount,
      collectionTraits: traits.collectionTraits,
      collectionSalesHistory: saleshistory.collectionSalesHistory,
      collectionSalesCount: saleshistory.collectionSalesTotal,
      licenses: listedLicenses.license,
      tags: tags.tags,
      user: user.user,
      isDarkMode: app.isDarkMode,
      app
    })
  );

  const dispatch = useDispatch();

  const { path: iconImage } = useFilePath({
    destination:
      collectionPage &&
      collectionPage.iconImage &&
      collectionPage.iconImage.s3 &&
      collectionPage.iconImage.s3.thumbnail
  });

  const handleReport = async () => {
    if (user && user._id) {
      try {
        await client.service("collection-reported").patch(user._id, {
          collection: collectionPage._id
        });
        dispatch(reloadCollectionReports());
      } catch (error) {
        errorNotification(error);
      }
    } else {
      store.addNotification({
        type: "warning",
        title: t("notification.errorNotification"),
        message: t("collections.inOrderToReport"),
        ...notificationOptions
      });
    }
  };

  const floorPrice = useMemo(() => {
    if (collectionPage) {
      return parseNFTPrice(
        collectionPage.floorPrice,
        SystemProgram.programId.toString()
      );
    }
    return {};
  }, [collectionPage]);

  const volume = useMemo(() => {
    if (collectionPage && collectionPage.volume) {
      if (collectionPage.volume > 1000) {
        return (collectionPage.volume / 1000).toFixed(2) + "K SOL";
      } else {
        return collectionPage.volume.toFixed(2) + " SOL";
      }
    }

    return "0 SOL";
  }, [collectionPage]);

  const handleLike = async () => {
    if (user && user._id) {
      try {
        const count = await client
          .service("user-collection-likes")
          .patch(user._id, {
            collection: collectionPage._id
          });
        dispatch(reloadCollectionLikes());
        setLikes(count);
      } catch (error) {
        errorNotification(error);
      }
    } else {
      store.addNotification({
        type: "warning",
        title: t("notification.notAllowed"),
        message: t("collections.inOrderToLike"),
        ...notificationOptions
      });
    }
  };

  useStyles(s);
  return (
    <>
      <section
        aria-label="section"
        className={`${s.banner} ${isDarkMode ? "dark-lighter" : "light-white"}`}
      >
        <Parallax
          blur={{ min: -15, max: 15 }}
          bgImage={
            headerImage ? headerImage : "/assets/no_collection_background.jpg"
          }
          strength={500}
          className={`container ${s.bannerImg}`}
        >
          {collectionPage.exhibitionId && (
            <p>View virtual exhibition on a desktop device.</p>
          )}
        </Parallax>
      </section>
      <section
        aria-label="section"
        className={`${s.dColl} ${
          isDarkMode ? "dark-lighter" : "light-white"
        } no-top`}
      >
        <div className={`container`}>
          <div className="row">
            <div className="col-md-12 mb-3">
              <div className={s.dProfile}>
                <div className={s.profileAvatar}>
                  {!collectionPage.verified && (
                    <div className={s.btnReport}>
                      <Link
                        to="#"
                        onClick={handleReport}
                        className={`${s.reportBtn}`}
                      >
                        <i
                          className={`fa fa-flag me-1 ${
                            collectionPage.userReported ? s.reported : ""
                          }`}
                        ></i>
                        <span>{t("collections.report")}</span>
                      </Link>
                    </div>
                  )}
                  <div className={s.dProfileImg}>
                    <img
                      src={
                        iconImage ? iconImage : "/assets/no_collection_icon.jpg"
                      }
                    />
                  </div>

                  <div className={s.profileName}>
                    <h1>
                      {collectionPage.title}{" "}
                      {collectionPage && collectionPage.verified && (
                        <i className="fa fa-check"></i>
                      )}
                    </h1>
                    {collectionPage.verified ? (
                      <span className={s.verifiedCollection}>
                        {t("collections.verifiedCollection")}
                      </span>
                    ) : (
                      <span className={s.unverifiedCollection}>
                        {t("collections.unverifiedCollection")}
                      </span>
                    )}
                    {collectionPage.tags && collectionPage.tags.length > 0 && (
                      <div className={s.tagHolder}>
                        {collectionPage.tags.map((trait, index) => (
                          <div
                            key={index}
                            className={`${s.counter} ${
                              isDarkMode ? "dark-collection-tag-holder" : ""
                            }`}
                          >
                            <p>{trait}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <ReadMore>{collectionPage.description}</ReadMore>
                  </div>
                </div>
              </div>
            </div>

            <div className="container">
              <div
                className={`${s.floorLinkContainer} ${
                  isDarkMode ? "dark-nft-border-bottom" : ""
                }`}
              >
                <div className={s.priceFloorholder}>
                  <h4
                    className={`${s.priceFloor} ${
                      isDarkMode ? "dark-volume-info-holder" : ""
                    }`}
                  >
                    {t("collections.listed")}{" "}
                    <span>
                      {collectionPage.nftCount ? collectionPage.nftCount : "0"}
                    </span>
                  </h4>
                  <h4
                    className={`${s.priceFloor} ${
                      isDarkMode ? "dark-volume-info-holder" : ""
                    }`}
                  >
                    {t("collections.floor")}{" "}
                    <span>
                      {floorPrice.price} {floorPrice.currency}
                    </span>
                  </h4>
                  <h4
                    className={`${s.priceFloor} ${
                      isDarkMode ? "dark-volume-info-holder" : ""
                    }`}
                  >
                    {t("collections.volume")} <span>{volume}</span>
                  </h4>
                </div>
                <div className={`d-flex ${s.viewsLikes}`}>
                  <div
                    className={`${s.views} ${
                      isDarkMode ? "dark-collection-tag-holder" : ""
                    }`}
                  >
                    <p>
                      <i className="fa fa-eye me-1"></i>
                      {collectionPage.views || 0}
                    </p>
                  </div>
                  <div
                    className={`${s.like} ${!user && s.noCursor} ${
                      isDarkMode ? "dark-collection-tag-holder" : ""
                    }`}
                    onClick={handleLike}
                  >
                    <p>
                      <i
                        className={`fa me-1 ${
                          collectionPage.userLiked ? "fa-heart" : "fa-heart-o"
                        }`}
                      ></i>
                      {likes}
                    </p>
                  </div>
                </div>
                <div className={`${s.collectionData}`}>
                  <ul>
                    {collectionPage.discord && (
                      <li>
                        <a
                          href={parseUrl(collectionPage.discord)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <img src="/assets/discord.svg" />
                        </a>
                      </li>
                    )}
                    {collectionPage.twitter && (
                      <li>
                        <a
                          href={parseUrl(collectionPage.twitter)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <img src="/assets/twitter.svg" />
                        </a>
                      </li>
                    )}
                    {collectionPage.website && (
                      <li>
                        <a
                          href={parseUrl(collectionPage.website)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <img src="/assets/globe.svg" />
                        </a>
                      </li>
                    )}
                    {collectionPage.telegram && (
                      <li>
                        <a
                          href={parseUrl(collectionPage.telegram)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <img src="/assets/telegram.svg" />
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-lg-12 mb-3">
              <CollectionPageFilters
                query={query}
                setQuery={setQuery}
                tags={tags}
                licenses={licenses}
                app={app}
                byCollection={false}
                isInline={true}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CollectionHeader;

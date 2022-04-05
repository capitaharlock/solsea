import React, { useEffect, useMemo, useState } from "react";
import s from "./ExhibitionHeader.scss";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import client from "../../../services/feathers";
import {
  reloadCollectionLikes,
  reloadCollectionReports
} from "../../../actions/user";
import { errorNotification } from "../../../helpers/nofiticationsFunction";
import { store } from "react-notifications-component";
import { notificationOptions } from "../../../../api/Definitions";
import { useTranslation } from "react-i18next";
import ReadMore from "../../../components/ReadMore/ReadMore";
import { parseNFTPrice } from "../../../hooks/parsePrice";
import { SystemProgram } from "@solana/web3.js";
import { parseUrl } from "../../../hooks/parseUrl";
import useStyles from "isomorphic-style-loader/useStyles";
import UnityComponent from "../../../components/UnityComponent/UnityComponent";
import { useFilePath } from "../../../hooks/useFilePath";

const ExhibitionHeader = () => {
  const { isDarkMode, collectionPage = [], user } = useSelector(
    ({ app, collections, user }) => ({
      isDarkMode: app.isDarkMode,
      collectionPage: collections.collectionPage,
      user: user.user,
      app
    })
  );

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [exhibitionLoaded, setExhibitionLoaded] = useState(false);
  const [message, setMessage] = useState("loading");
  const [likes, setLikes] = useState(
    (collectionPage && collectionPage.liked) || 0
  );

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

  useEffect(() => {
    if (collectionPage) {
      setLikes(collectionPage.liked || 0);
    }
  }, [collectionPage]);

  useEffect(() => {
    window.onmessage = e => {
      if (
        e.origin === "https://web2.vrallart.com" ||
        e.origin === "https://web.vrallart.com"
      ) {
        if (e.data === "started") {
          setExhibitionLoaded(true);
        }
        setMessage(e.data);
      }
    };
  }, []);

  const { path: headerImage } = useFilePath({
    destination:
      collectionPage &&
      collectionPage.headerImage &&
      collectionPage.headerImage.s3 &&
      collectionPage.headerImage.s3.preview
  });

  useStyles(s);

  return (
    <>
      <section
        className={`${s.banner} ${isDarkMode ? "dark-lighter" : "light-white"}`}
      >
        <div className={s.vrExhibition}>
          {!exhibitionLoaded ? (
            <div
              className={`${s.imageWrapper} ${
                !exhibitionLoaded ? s.loading : ""
              }`}
              style={{ backgroundImage: `url("${headerImage}")` }}
            >
              <p className={s.message}>{message}</p>
            </div>
          ) : null}
          <UnityComponent
            iframeLink={collectionPage.exhibitionId}
            isExhibitionLoaded={exhibitionLoaded}
          />
        </div>
        <div className={`d-flex justify-content-center ${s.textContainer}`}>
          <span>
            When the exhibition loads, use arrow keys or ASWD keys to move. Drag
            with mouse to look around and click on the floor to move.
          </span>
        </div>
      </section>
      <section aria-label="section" className={`${s.headerContainer} no-top`}>
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
                  <div className={s.profileName}>
                    <h1>
                      {collectionPage.title}{" "}
                      {collectionPage && collectionPage.verified && (
                        <i className="fa fa-check"></i>
                      )}
                    </h1>

                    {/* {collectionPage.verified ? (
                      <span className={s.verifiedCollection}>
                        {t("collections.verifiedCollection")}
                      </span>
                    ) : (
                      <span className={s.unverifiedCollection}>
                        {t("collections.unverifiedCollection")}
                      </span>
                    )} */}
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
          </div>
        </div>
      </section>
    </>
  );
};

export default ExhibitionHeader;

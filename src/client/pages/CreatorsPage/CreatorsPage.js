import React, { useEffect, useRef, useState } from "react";
import { Route, useRouteMatch } from "react-router";
import Seo from "../../components/Seo/Seo";
import { useFilePath } from "../../hooks/useFilePath.js";
import s from "./CreatorsPage.scss";
import { useDispatch, useSelector } from "react-redux";
import withStyles from "isomorphic-style-loader/withStyles";
import Loader from "../../components/Loader/Loader";
import { Parallax } from "react-parallax";
import { parseUrl } from "../../hooks/parseUrl";
import CreatorSwitch from "../../components/SwitchSection/CreatorSwitch";
import client from "../../services/feathers";
import NftItem from "../../components/NftItem/NftItem";
import CollectionItem from "../../components/CollectionItem/CollectionItem";
import { SET_CREATOR_NFTS } from "../../actions/nft";
import { SET_CREATOR_COLLECTIONS } from "../../actions/collections";
import { handleCreatorPage } from "../../actions/pages";
import CreatorFilters from "./CreatorFilters";
import { SET_LICENSES } from "../../actions/licenses";
import { SET_TAGS } from "../../actions/tags";
import ContentLoader from "../../components/Loader/ContentLoader";
import InfiniteScroll from "react-infinite-scroller";
import { nftSortOptions } from "../../../api/Definitions";
import { loadCreator, RESET_CREATOR_PAGE } from "../../actions/creators";
import { useTranslation } from "react-i18next";

const CreatorsPage = () => {
  const {
    creatorCollections = [],
    collectionsTotal,
    creatorNfts = [],
    total,
    licenses,
    tags,
    isDarkMode,
    app,
    creator
  } = useSelector(
    ({
      user,
      nfts,
      collections,
      tags,
      listedLicenses,
      app,
      creators = {}
    }) => ({
      user,
      creatorNfts: nfts.creatorNfts,
      total: nfts.creatorTotal,
      creatorCollections: collections.creatorCollections,
      collectionsTotal: collections.creatorTotal,
      licenses: listedLicenses.license,
      walletKey: user.walletKey,
      tags: tags.tags,
      isDarkMode: app.isDarkMode,
      app,
      creator: creators.creatorPage
    })
  );

  const { t } = useTranslation();
  const match = useRouteMatch();
  const dispatch = useDispatch();

  const [query, setQuery] = useState({});
  const [isLoading, setLoading] = useState(false);
  const [isNftLoading, setNftLoading] = useState(false);
  const [isCollectionLoading, setCollectionLoading] = useState(false);
  const [isInfinityLoading, setInfinityLoading] = useState(false);

  const skip = useRef(0);

  useEffect(() => {
    if (!app.isInitialRender) {
      skip.current = 0;
      dispatch(loadCreator(match.params._id)).then(() => {
        setLoading(false);
      });
      loadLicences();
      loadTags();
      loadCollections();
    }
    return () => {
      dispatch({
        type: RESET_CREATOR_PAGE
      });
    };
  }, []);

  useEffect(() => {
    loadNfts(true);
  }, [query]);

  const loadNfts = async (clear = true, offset = 0) => {
    const creatorsNftsService = client.service("creators-nfts");
    if (clear) {
      setNftLoading(true);
    } else {
      setInfinityLoading(true);
    }
    try {
      const listed = await creatorsNftsService.get(match.params._id, {
        query: {
          $sort: { views: -1 },
          ...query,
          $skip: offset,
          $limit: 20
        }
      });
      dispatch({
        type: SET_CREATOR_NFTS,
        payload: {
          data: listed.data,
          clear,
          total: listed.total
        }
      });
      setNftLoading(false);
      setInfinityLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const loadCollections = async (clear = true, $skip = 0) => {
    setCollectionLoading(true);
    const collectionService = client.service("collections");
    try {
      const collection = await collectionService.find({
        query: {
          user: { $in: match.params._id },
          $skip,
          $limit: 20,
          $populate: ["headerImage", "iconImage"]
        }
      });
      dispatch({
        type: SET_CREATOR_COLLECTIONS,
        payload: { data: collection.data, total: collection.total, clear }
      });
      setCollectionLoading(false);
      return;
    } catch (error) {
      console.log(error);
    }
  };

  const loadLicences = async () => {
    try {
      const res = await client.service("licenses").find({});
      dispatch({
        type: SET_LICENSES,
        clear: true,
        payload: { data: res.data }
      });
    } catch (error) {
      console.log(error);
    }
  };

  const loadTags = async () => {
    try {
      const res = await client.service("nfttags").find({});
      dispatch({
        type: SET_TAGS,
        payload: res
      });
    } catch (error) {
      console.log(error);
    }
  };

  const { path: profileImage } = useFilePath({
    destination:
      creator &&
      creator.profile &&
      creator.profile.profileImage &&
      creator.profile.profileImage.s3 &&
      creator.profile.profileImage.s3.thumbnail
  });

  const { path: headerImage } = useFilePath({
    destination:
      creator &&
      creator.profile &&
      creator.profile.headerImage &&
      creator.profile.headerImage.s3 &&
      creator.profile.headerImage.s3.preview
  });

  return (
    <div className={s.seo}>
      <Seo
        title={
          creator && creator.profile && creator.profile.name
            ? creator.profile.name + " | Solsea"
            : `${t("seo.creator")} | Solsea`
        }
        imageUrl={headerImage}
      />

      {app.isInitialRender && isLoading ? (
        <Loader />
      ) : (
        <>
          <section
            aria-label="section"
            className={`${s.banner} thumbnail ${
              isDarkMode ? "dark-lighter-no-shadow" : "light-white"
            }`}
          >
            <Parallax
              blur={{ min: -15, max: 15 }}
              bgImage={
                headerImage ? headerImage : "/assets/no_creator_background.jpg"
              }
              strength={500}
              className={`container ${s.bannerImg}`}
            >
              <div className={s.profileAvatar}>
                <div className={s.profileImаgе}>
                  <img
                    src={profileImage ? profileImage : "/assets/profile.svg"}
                  />
                </div>
                <div className={s.profileName}>
                  <h1>
                    {creator && creator.profile && creator.profile.name
                      ? creator.profile.name
                      : ""}
                  </h1>
                </div>
                <div className={s.location}>
                  <p>
                    {creator &&
                      creator.profile &&
                      creator.profile.location &&
                      creator.profile.location}
                  </p>
                </div>
              </div>
            </Parallax>
          </section>
          <section
            aria-label="section"
            className={`${s.backgroundPart} banner no-top ${
              isDarkMode ? "dark-lighter" : "light-white"
            }`}
          >
            <div className={`container`}>
              <div>
                <div className={`${s.switchMediaContainer}`}>
                  <div className={s.emptyDiv}></div>
                  <div className={`${s.switch}`}>
                    <CreatorSwitch />
                  </div>
                  <div className={`${s.userData}`}>
                    <ul>
                      {creator && creator.profile && creator.profile.twitter ? (
                        <li>
                          <a
                            href={parseUrl(creator.profile.twitter)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <img src="/assets/twitter.svg" />
                          </a>
                        </li>
                      ) : (
                        ""
                      )}
                      {creator && creator.profile && creator.profile.website ? (
                        <li>
                          <a
                            href={parseUrl(creator.profile.website)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <img src="/assets/globe.svg" />
                          </a>
                        </li>
                      ) : (
                        ""
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section>
            <Route exact path={match.path + "/biography"}>
              <div className={`container page-wrapper ${s.biographyWrapper}`}>
                <h2>{t("creatorsPage.creatorsBiography")}</h2>
                <p>
                  {creator && creator.profile && creator.profile.description
                    ? creator.profile.description
                    : ""}
                </p>
              </div>
            </Route>
          </section>
          <section>
            <Route exact path={match.path + "/nfts"}>
              <div className={`container page-wrapper p-0`}>
                <div className={`d-flex ${s.featuredContainer}`}>
                  <div>
                    <div className="col-lg-12 mb-3">
                      <CreatorFilters
                        query={query}
                        setQuery={setQuery}
                        tags={tags}
                        licenses={licenses}
                        app={app}
                        byCollection={false}
                        isInline={true}
                        sortOptions={nftSortOptions}
                      />
                    </div>
                    <h2>{t("creatorsPage.creatorsNfts")}</h2>
                    <div className="container position-relative">
                      {isNftLoading ? (
                        <ContentLoader />
                      ) : creatorNfts.length > 0 ? (
                        <InfiniteScroll
                          pageStart={0}
                          loadMore={() => {
                            if (!isNftLoading) {
                              loadNfts(false, creatorNfts.length);
                            }
                          }}
                          hasMore={creatorNfts.length < total}
                          threshold={250}
                          className={`d-flex ${s.nftContainer}`}
                        >
                          {creatorNfts.map((nft, index) => (
                            <div
                              key={index}
                              className={`d-flex col-lg-3 col-md-6 col-sm-6 col-xs-12 ${s.nftItem}`}
                            >
                              <NftItem {...nft} />
                            </div>
                          ))}
                        </InfiniteScroll>
                      ) : (
                        <div>
                          <p style={{ fontSize: "24px" }} className={s.noNft}>
                            {t("creatorsPage.noNftMatching")}
                          </p>
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        height: "100px",
                        width: "100%",
                        position: "relative"
                      }}
                    >
                      {isInfinityLoading &&
                        creatorNfts &&
                        creatorNfts.length > 0 && <ContentLoader />}
                    </div>
                  </div>
                </div>
              </div>
            </Route>
          </section>
          <section className={`p-0`}>
            <Route exact path={match.path + "/collections"}>
              <div className={`container page-wrapper p-0`}>
                <div className={`d-flex ${s.featuredContainer}`}>
                  <h2>{t("creatorsPage.creatorsCollections")}</h2>
                  <div className="container position-relative">
                    {creatorCollections && creatorCollections.length > 0 ? (
                      <InfiniteScroll
                        pageStart={0}
                        loadMore={() => {
                          if (!isNftLoading) {
                            loadCollections(false, creatorCollections.length);
                          }
                        }}
                        hasMore={creatorCollections.length < collectionsTotal}
                        threshold={250}
                        className={`row ${s.nftContainer}`}
                      >
                        {creatorCollections.map(collection => (
                          <div
                            className={`d-flex col-lg-4 col-md-6 col-sm-6 col-xs-12 ${s.collectionItem}`}
                            key={collection._id}
                          >
                            <CollectionItem {...collection} />
                          </div>
                        ))}
                      </InfiniteScroll>
                    ) : (
                      <span>{t("creatorsPage.noCollectionYet")}</span>
                    )}
                  </div>
                  <div
                    style={{
                      height: "100px",
                      width: "100%",
                      position: "relative"
                    }}
                  >
                    {isCollectionLoading &&
                      creatorCollections &&
                      creatorCollections.length > 0 && <ContentLoader />}
                  </div>
                </div>
              </div>
            </Route>
          </section>
        </>
      )}
    </div>
  );
};

const loadData = (store, params, req) => {
  return store.dispatch(handleCreatorPage(params, req));
};

export default {
  loadData,
  component: withStyles(s)(CreatorsPage)
};

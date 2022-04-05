import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useHistory, useRouteMatch } from "react-router";
import Seo from "../../components/Seo/Seo";
import { useFilePath } from "../../hooks/useFilePath.js";
import client from "../../services/feathers";
import s from "./CollectionPage.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  getCollectionPageData,
  SET_COLLECTION_NFTS,
  SET_COLLECTION_PAGE
} from "../../actions/pages";
import { SET_COLLECTION_SALES_HISTORY } from "../../actions/saleshistory";
import { RESET_COLLECTION_PAGE } from "../../actions/collections";
import { SET_LICENSES } from "../../actions/licenses";
import { SET_TAGS } from "../../actions/tags";
import { mapTraits, SET_COLLECTION_TRAITS } from "../../actions/traits";
import { useClientLoading } from "../../hooks/useClientLoading";
import withStyles from "isomorphic-style-loader/withStyles";
import Loader from "../../components/Loader/Loader";
import CollapseTraits from "../../components/CollapseTraits/CollapseTraits";
import InfiniteScroll from "react-infinite-scroller";
import ContentLoader from "../../components/Loader/ContentLoader";
import { useTileSize } from "../../hooks/useTileSize";
import { NftTilesLayout } from "../../layout/NftTilesLayout";
import ExploreSwitch from "../../components/SwitchSection/ExploreSwitch";
import ExploreActivity from "../../components/ExploreActivity/ExploreActivity";
import { useTranslation } from "react-i18next";
import useHistorySnapshot from "../../hooks/useHistorySnapshot";
import CollectionHeader from "./CollectionHeader/CollectionHeader";
import ExhibitionHeader from "./ExhibitionHeader/ExhibitionHeader";
import CollectionPageFilters from "./CollectionPageFilters";
import { isMobile } from "react-device-detect";
import ExploreCollectionSwitch from "../../components/SwitchSection/ExploreCollectionSwitch";

const CollectionPage = () => {
  const { t } = useTranslation();
  const {
    collectionPage = {},
    collectionNfts = [],
    collectionTraits = [],
    collectionSalesHistory = [],
    collectionSalesCount = 0,
    collectionNftsCount = 0,
    licenses,
    isDarkMode,
    // user,
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
  const history = useHistory();
  const nftsOffset = useRef(0);
  const [query, setQuery] = useState({});
  const [traitsQuery, setTraitsQuery] = useState({});
  const [likes, setLikes] = useState(
    (collectionPage && collectionPage.liked) || 0
  );
  const [isInfiniteLoading, setInfiniteLoading] = useState(false);
  const [isNFTLoading, setNFTLoading] = useState(false);
  const match = useRouteMatch();
  const [tilesContainerRef, tileSize] = useTileSize();
  const salesHistoryOffset = useRef(0);
  const [salesHistoryLoading, setSalesHistoryLoading] = useState(false);
  const [showActivityTab, setShowActivityTab] = useState(false);

  const loadInitialData = async () => {
    await Promise.all([
      loadCollection(),
      loadTraits(),
      loadTags(),
      loadLicences()
    ]);
  };

  const isLoading = useClientLoading({
    load: loadInitialData,
    isInitialRender: app.isInitialRender,
    params: {}
  });

  const [historySnapshotProcessed, setHistorySnapshotProcessed] = useState(
    false
  );
  const historySnapshot = useHistorySnapshot({
    query,
    traitsQuery,
    collectionNfts,
    collectionNftsCount,
    showActivityTab,
    collectionSalesHistory,
    collectionSalesCount,
    nftsOffset: nftsOffset.current,
    salesHistoryOffset: salesHistoryOffset.current
  });

  useLayoutEffect(() => {
    if (
      historySnapshot &&
      history.action === "POP" &&
      !historySnapshotProcessed
    ) {
      nftsOffset.current = historySnapshot.snapshot.nftsOffset;
      salesHistoryOffset.current = historySnapshot.snapshot.salesHistoryOffset;
      setQuery({ ...historySnapshot.snapshot.query });
      setTraitsQuery({ ...historySnapshot.snapshot.traitsQuery });
      setShowActivityTab(historySnapshot.snapshot.showActivityTab);
      dispatch({
        type: SET_COLLECTION_NFTS,
        clear: true,
        payload: {
          data: [...historySnapshot.snapshot.collectionNfts],
          clear: true,
          total: historySnapshot.snapshot.collectionNftsCount
        }
      });
      dispatch({
        type: SET_COLLECTION_SALES_HISTORY,
        payload: {
          data: [...historySnapshot.snapshot.collectionSalesHistory],
          clear: true,
          total: historySnapshot.snapshot.collectionSalesCount
        }
      });
      let loopAttempts = 0;
      const loop = () => {
        if (window.scrollY !== historySnapshot.snapshot.scrollY) {
          loopAttempts++;
          window.scrollTo(0, historySnapshot.snapshot.scrollY);
          if (
            document.body.scrollHeight > historySnapshot.snapshot.scrollY &&
            loopAttempts < 10
          )
            window.requestAnimationFrame(loop);
        } else setHistorySnapshotProcessed(true);
      };
      window.requestAnimationFrame(loop);
    }
  }, [isLoading]);

  const { path: headerImage } = useFilePath({
    destination:
      collectionPage &&
      collectionPage.headerImage &&
      collectionPage.headerImage.s3 &&
      collectionPage.headerImage.s3.preview
  });

  const loadCollection = async () => {
    try {
      const collectionService = client.service("collections");
      const res = await collectionService.get(match.params._id);
      dispatch({
        type: SET_COLLECTION_PAGE,
        payload: res
      });
    } catch (error) {
      history.replace("/404");
    }
  };

  const onLoadMoreNFTs = () => {
    if (!isInfiniteLoading) loadMoreNFTs(false);
  };

  const loadMoreNFTs = () => {
    nftsOffset.current = collectionNfts.length;
    loadNFTs(false);
  };

  const loadNFTs = async (clear = true) => {
    if (
      history.action === "POP" &&
      historySnapshot &&
      !historySnapshotProcessed
    )
      return;

    if (clear) {
      nftsOffset.current = 0;
      setNFTLoading(true);
    } else {
      setInfiniteLoading(true);
    }
    try {
      const nftItems = await client.service("nft-listed").find({
        query: {
          nsfw: { $in: [false, null] },
          nft_collection: match.params._id,
          ...normalizeTraitsQuery(traitsQuery),
          ...query,
          isPrivateSale: false,
          $skip: nftsOffset.current,
          $limit: 24
        }
      });
      dispatch({
        type: SET_COLLECTION_NFTS,
        clear,
        payload: {
          data: nftItems.data,
          clear,
          total: nftItems.total
        }
      });
      setInfiniteLoading(false);
      setNFTLoading(false);
      return;
    } catch (error) {
      // console.log(error);
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
      // console.log(error);
    }
  };

  const loadTags = async () => {
    try {
      const res = await client.service("nfttags").find({});
      dispatch({
        type: SET_TAGS,
        clear: true,
        payload: { data: res.data }
      });
    } catch (error) {
      // console.log(error);
    }
  };

  const loadTraits = async () => {
    try {
      const traits = await client.service("/v1/traits").find({
        query: {
          nft_collection: match.params._id
        }
      });
      const mappedTraits = mapTraits(traits);
      dispatch({
        type: SET_COLLECTION_TRAITS,
        clear: true,
        payload: mappedTraits
      });
    } catch (error) {
      // console.log(error);
    }
  };

  const normalizeTraitsQuery = traitsQuery => {
    const traitsKeys = Object.keys(traitsQuery);
    const resultQuery = { "Properties.attributes": { $all: [] } };
    if (traitsKeys.length > 0) {
      traitsKeys.forEach(traitKey => {
        Object.keys(traitsQuery[traitKey]).forEach(traitValue => {
          resultQuery["Properties.attributes"].$all.push({
            $elemMatch: {
              trait_type: traitKey,
              value: traitValue
            }
          });
        });
      });
      return resultQuery;
    }
    return {};
  };

  const loadSalesHistory = async (clear = false) => {
    try {
      if (
        history.action === "POP" &&
        historySnapshot &&
        !historySnapshotProcessed
      )
        return;
      setSalesHistoryLoading(true);
      if (clear) salesHistoryOffset.current = 0;

      const feathersQuery = {
        query: {
          status: "SOLD",
          $sort: query.$sort
            ? query.$sort
            : {
                createdAt: -1
              },
          ...query,
          ...normalizeTraitsQuery(traitsQuery),
          listed: false,
          nft_collection: match.params._id,
          $skip: salesHistoryOffset.current,
          $limit: 12
        },
        $populate: ["image"]
      };
      feathersQuery.query.$sort._id = 1;

      const res = await client.service("listed-archive").find(feathersQuery);
      dispatch({
        type: SET_COLLECTION_SALES_HISTORY,
        payload: { data: res.data, clear, total: res.total }
      });
      setSalesHistoryLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!app.isInitialRender) {
      loadNFTs(true);
    }
  }, []);

  useEffect(() => {
    if (collectionPage) {
      setLikes(collectionPage.liked || 0);
    }
  }, [collectionPage]);

  useEffect(() => {
    if (!app.isInitialRender) {
      if (showActivityTab) loadSalesHistory(true);
      else loadNFTs(true);
    }
  }, [query, traitsQuery]);

  useEffect(() => {
    return () => {
      dispatch({
        type: RESET_COLLECTION_PAGE
      });
    };
  }, []);

  const onTraitSelect = trait => {
    const query = { ...traitsQuery };
    if (query[trait.trait_type] && query[trait.trait_type][trait.type]) {
      delete query[trait.trait_type][trait.type];
      if (Object.keys(query[trait.trait_type]).length === 0)
        delete query[trait.trait_type];
    } else {
      if (!query[trait.trait_type]) query[trait.trait_type] = {};
      query[trait.trait_type][trait.type] = true;
    }
    setTraitsQuery(query);
  };

  const traitsMenu = () => {
    if (collectionTraits && collectionTraits.length > 0) {
      return (
        <aside className={`${s.asideLeft} mb-3`}>
          {collectionTraits.map(
            (t, index) =>
              t.value.length < 1000 && (
                <CollapseTraits
                  key={index}
                  trait={t}
                  value={traitsQuery[t.trait_type]}
                  onTraitSelect={onTraitSelect}
                />
              )
          )}
        </aside>
      );
    }
    return <></>;
  };

  return (
    <div className={s.section}>
      <Seo
        title={
          collectionPage && collectionPage.title
            ? collectionPage.title + " | Solsea"
            : `${t("seo.collection")} | Solsea`
        }
        imageUrl={headerImage}
      />
      {!app.isInitialRender && isLoading ? (
        <Loader />
      ) : !collectionPage ? (
        <div>{t("nftPage.notFound")}</div>
      ) : (
        <>
          {(!collectionPage.exhibitionId || isMobile) && (
            <CollectionHeader
              likes={likes}
              query={query}
              setQuery={setQuery}
              setLikes={setLikes}
              headerImage={headerImage}
            />
          )}
          {collectionPage.exhibitionId && !isMobile && (
            <div
              className={`${s.headerContainer} ${
                isDarkMode ? "dark-lighter" : ""
              }`}
            >
              <ExhibitionHeader />
              <div className={`container col-lg-12 pb-3 mb-3`}>
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
          )}
          <div>
            <ExploreCollectionSwitch
              activity={showActivityTab}
              setActivity={async show => {
                if (show) await loadSalesHistory(true);
                else await loadNFTs(true);
                setShowActivityTab(show);
              }}
            />
          </div>
          {!showActivityTab ? (
            <section className={`${s.nftsSection}`}>
              <div className={s.container}>
                {traitsMenu()}
                <div
                  ref={tilesContainerRef}
                  className={`mb-3 ${s.nftContainer}`}
                >
                  {isNFTLoading ? (
                    <ContentLoader />
                  ) : !isNFTLoading && collectionNfts.length === 0 ? (
                    <div className={s.noResult}>
                      {collectionPage._id === "61b75ee47362cf61b1b987e7" ? (
                        <p style={{ fontSize: "30px" }}>
                          Primary sale available through the virtual fair.
                        </p>
                      ) : (
                        <p style={{ fontSize: "24px" }}>
                          {t("creatorsPage.noNftMatching")}
                        </p>
                      )}
                    </div>
                  ) : (
                    <InfiniteScroll
                      pageStart={0}
                      loadMore={onLoadMoreNFTs}
                      hasMore={collectionNfts.length < collectionNftsCount}
                      threshold={250}
                      className={`d-flex flex-wrap ${s.nftHolder}`}
                    >
                      <NftTilesLayout
                        nfts={collectionNfts}
                        className={s.nftItemHolder}
                        tileSize={tileSize}
                      />
                    </InfiniteScroll>
                  )}
                  {isInfiniteLoading && collectionNfts.length > 0 && (
                    <div
                      style={{
                        height: "100px",
                        width: "100%",
                        position: "relative"
                      }}
                    >
                      <ContentLoader />
                    </div>
                  )}
                </div>
              </div>
            </section>
          ) : (
            <section className={`${s.activitySection}`}>
              <div className={s.container}>
                {traitsMenu()}
                <div
                  ref={tilesContainerRef}
                  className={`mb-3 ${s.activityContainer}`}
                >
                  {!salesHistoryLoading &&
                  collectionSalesHistory.length === 0 ? (
                    <div className={s.noResult}>
                      <p style={{ fontSize: "24px" }}>
                        {t("collections.noActivities")}
                      </p>
                    </div>
                  ) : (
                    <InfiniteScroll
                      pageStart={0}
                      loadMore={async () => {
                        if (!salesHistoryLoading) {
                          salesHistoryOffset.current =
                            collectionSalesHistory.length;
                          await loadSalesHistory(false);
                        }
                      }}
                      hasMore={
                        collectionSalesHistory.length < collectionSalesCount
                      }
                      threshold={250}
                      className={s.activityItemsContainer}
                    >
                      <ExploreActivity saleshistory={collectionSalesHistory} />
                    </InfiniteScroll>
                  )}
                </div>
              </div>
              {salesHistoryLoading && (
                <div
                  style={{
                    height: "100px",
                    width: "100%",
                    position: "relative"
                  }}
                >
                  <ContentLoader />
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
};

const loadData = (store, params, query, path, req) => {
  return store.dispatch(getCollectionPageData(params, req));
};

export default {
  loadData,
  component: withStyles(s)(CollectionPage)
};

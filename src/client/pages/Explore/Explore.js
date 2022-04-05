import React, { useEffect, useState, useRef } from "react";
import NftItem from "../../components/NftItem/NftItem";
import client from "../../services/feathers";
import s from "./Explore.scss";
import ExploreFilters from "./ExploreFilters";
import Seo from "../../components/Seo/Seo";
import withStyles from "isomorphic-style-loader/withStyles";
import { useDispatch, useSelector } from "react-redux";
import {
  getNftExploreData,
  SET_GOLDEN_NFTS,
  SET_LISTED_NFTS
} from "../../actions/pages";
import { SET_EXPLORE_FILTERS } from "../../actions/explore";
import InfiniteScroll from "react-infinite-scroller";
import ContentLoader from "../../components/Loader/ContentLoader";
import { SET_TAGS } from "../../actions/tags";
import { SET_LICENSES } from "../../actions/licenses";
import { Prompt, Route, useHistory, useRouteMatch } from "react-router";
import { useStateWithCallback } from "../../hooks/useStateWithCallback";
import { SET_SALES_HISTORY } from "../../actions/saleshistory";
import ExploreSwitch from "../../components/SwitchSection/ExploreSwitch";
import ExploreActivity from "../../components/ExploreActivity/ExploreActivity";
import { useTileSize } from "../../hooks/useTileSize";
import { NftTilesLayout } from "../../layout/NftTilesLayout";
import { useTranslation } from "react-i18next";

const Explore = () => {
  const {
    listedNfts,
    goldenNfts,
    total,
    tags,
    licenses,
    app,
    filters,
    defaultFilters,
    initialFilters,
    saleshistory,
    isDarkMode,
    salesTotal,
    scrollY
  } = useSelector(
    ({ saleshistory, nfts, tags, listedLicenses, app, explore }) => ({
      listedNfts: nfts.listedNfts,
      goldenNfts: nfts.goldenNfts,
      total: nfts.total,
      saleshistory: saleshistory.saleshistory,
      salesTotal: saleshistory.total,
      tags: tags.tags,
      licenses: listedLicenses.license,
      isDarkMode: app.isDarkMode,
      app,
      filters: explore.filters,
      defaultFilters: explore.defaultFilters,
      initialFilters: explore.initialFilters,
      scrollY: explore.scrollY
    })
  );

  const history = useHistory();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [loadActivity, setLoadActivity] = useState("golden");
  const [firstLoad, setFirstLoad] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isInfiniteLoading, setInfiniteLoading] = useState(false);
  const [count, setCount] = useState(total);
  const [tilesContainerRef, tileSize] = useTileSize();

  const [queryFilter, setQueryFilter] = useStateWithCallback(
    () => {
      return app.isInitialRender
        ? { ...initialFilters }
        : history.action === "PUSH"
        ? { ...initialFilters }
        : { ...filters };
    },
    () => {
      if (!firstLoad) {
        if (loadActivity === "golden") {
          loadGoldenNFTs(true);
        } else if (loadActivity === "activity") {
          loadSalesHistory(true);
        } else if (loadActivity === "explore") {
          loadNFTs(true);
        }
      }
    }
  );

  console.log(queryFilter);

  const match = useRouteMatch();

  useEffect(() => {
    if (!app.isInitialRender && history.action === "PUSH") {
      loadGoldenNFTs(true);
      loadTags();
      loadLicences();
    } else {
      setFirstLoad(false);
    }
  }, []);

  useEffect(() => {
    if (loadActivity === "golden") {
      loadGoldenNFTs(true);
    } else if (loadActivity === "activity") {
      loadSalesHistory(true);
    } else if (loadActivity === "explore") {
      loadNFTs(true);
    }
  }, [loadActivity]);

  const loadSalesHistory = async (clear = true, offset = 0) => {
    const loadFilter = { ...defaultFilters, ...queryFilter };

    if (clear) {
      setLoading(true);
    } else {
      setInfiniteLoading(true);
    }

    try {
      const res = await client.service("listed-archive").find({
        query: {
          status: "SOLD",
          $sort: {
            createdAt: -1
          },
          ...loadFilter,
          listed: false,
          $skip: offset,
          $limit: 24
        },
        $populate: ["image"]
      });
      dispatch({
        type: SET_SALES_HISTORY,
        payload: { data: res.data, clear, total: res.total }
      });
      setCount(res.total);
      setInfiniteLoading(false);
      setLoading(false);
      if (firstLoad) setFirstLoad(false);
    } catch (error) {
      console.log(error);
    }
  };

  const loadTags = async () => {
    try {
      const res = await client.service("nfttags").find({});
      dispatch({
        type: SET_TAGS,
        payload: { data: res.data }
      });
    } catch (error) {
      // console.log(error);
    }
  };

  const loadLicences = async () => {
    try {
      const res = await client.service("licenses").find({});
      dispatch({
        type: SET_LICENSES,
        payload: { data: res.data }
      });
    } catch (error) {
      // console.log(error);
    }
  };

  const _timeout = useRef();

  const loadNFTs = async (clear = true, offset = 0) => {
    const loadFilter = { ...defaultFilters, ...queryFilter };
    if (clear) {
      setLoading(true);
    } else {
      setInfiniteLoading(true);
    }

    try {
      if (loadFilter.$sort) loadFilter.$sort.Pubkey = 1;
      else
        loadFilter.$sort = {
          Pubkey: 1
        };

      const res = await client.service("nft-listed").find({
        query: {
          ...loadFilter,
          $skip: offset,
          ignoreStakeSort: true
        }
      });
      dispatch({
        type: SET_LISTED_NFTS,
        payload: { data: res.data, clear, total: res.total }
      });
      setCount(res.total);
      setInfiniteLoading(false);
      setLoading(false);
      if (firstLoad) setFirstLoad(false);
    } catch (error) {
      console.log(error);
    }
  };

  const loadGoldenNFTs = async (clear = true, offset = 0) => {
    const loadFilter = { ...defaultFilters, ...queryFilter };
    if (clear) {
      setLoading(true);
    } else {
      setInfiniteLoading(true);
    }

    try {
      if (loadFilter.$sort) loadFilter.$sort.Pubkey = 1;
      else
        loadFilter.$sort = {
          Pubkey: 1
        };

      const res = await client.service("nft-listed").find({
        query: {
          ...loadFilter,
          $skip: offset,
          stakeAmount: { $gt: 0 }
        }
      });
      dispatch({
        type: SET_GOLDEN_NFTS,
        payload: { data: res.data, clear, total: res.total }
      });
      setCount(res.total);
      setInfiniteLoading(false);
      setLoading(false);
      if (firstLoad) setFirstLoad(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <Prompt
        message={(location, action) => {
          dispatch({
            type: SET_EXPLORE_FILTERS,
            payload: { ...queryFilter }
          });
          return true;
        }}
      />
      <Seo title={`Solsea | ${t("seo.exploreNFT")}`} />
      <section
        aria-label="section"
        className={`banner-lower-margin ${
          isDarkMode ? "dark-lighter" : "light-white"
        } profile-banner d-flex`}
      >
        <div className="container">
          <div className="row">
            <h1>{t("exploreNft.explore")}</h1>
            <div className="col-lg-12 mb-3">
              <ExploreFilters
                query={{ ...queryFilter }}
                setQuery={filters => {
                  setQueryFilter({ ...filters });
                  dispatch({
                    type: SET_EXPLORE_FILTERS,
                    payload: { ...filters }
                  });
                }}
                tags={tags}
                licenses={licenses}
                total={count}
                app={app}
              />
            </div>
          </div>
        </div>
      </section>
      <div className={`container ${s.activity}`}>
        <ExploreSwitch
          activity={loadActivity}
          setActivity={explore => {
            setLoadActivity(explore);
          }}
        />
        <h4 className={`${s.totalCounter}`}>
          {t("filters.totalItems")} {total}
        </h4>
      </div>
      <div>
        <div className="container page-wrapper">
          <div className="row">
            <div
              ref={tilesContainerRef}
              className={`col-lg-12 position-relative ${s.container}`}
            >
              {loading ? (
                <ContentLoader />
              ) : ((listedNfts && listedNfts.length) ||
                  (goldenNfts && goldenNfts.length) ||
                  (saleshistory && saleshistory.length)) > 0 ? (
                <InfiniteScroll
                  pageStart={0}
                  loadMore={() => {
                    if (!loading && !isInfiniteLoading) {
                      if (loadActivity === "explore") {
                        loadNFTs(false, listedNfts.length);
                      } else if (loadActivity === "golden") {
                        loadGoldenNFTs(false, goldenNfts.length);
                      } else if (loadActivity === "activity") {
                        loadSalesHistory(false, saleshistory.length);
                      }
                    }
                  }}
                  hasMore={
                    loadActivity === "explore"
                      ? listedNfts && listedNfts.length < count
                      : loadActivity === "golden"
                      ? goldenNfts && goldenNfts.length < count
                      : loadActivity === "activity"
                      ? saleshistory && saleshistory.length < count
                      : false
                  }
                  threshold={250}
                  className={` ${s.exploreNft}`}
                >
                  {loadActivity === "golden" && (
                    <NftTilesLayout
                      nfts={goldenNfts}
                      className={s.nftItemHolder}
                      tileSize={tileSize}
                    />
                  )}
                  <div className={`nft-global`}>
                    {listedNfts.map(nft => (
                      <>
                        <NftItem {...nft} />
                      </>
                    ))}
                  </div>
                  {/* {loadActivity === "explore" && (
                    <NftTilesLayout
                      nfts={listedNfts}
                      className={s.nftItemHolder}
                      tileSize={tileSize}
                    />
                  )} */}
                  {loadActivity === "activity" && (
                    <ExploreActivity saleshistory={saleshistory} />
                  )}
                  {/* {!loadActivity ? (
                    <NftTilesLayout
                      nfts={listedNfts}
                      className={s.nftItemHolder}
                      tileSize={tileSize}
                    />
                  ) : (
                    <ExploreActivity saleshistory={saleshistory} />
                  )} */}
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
              style={{ height: "100px", width: "100%", position: "relative" }}
            >
              {isInfiniteLoading &&
                (listedNfts.length > 0 ||
                  (goldenNfts && goldenNfts.length > 0)) && <ContentLoader />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const loadData = (store, params, query, path, req) => {
  return store.dispatch(getNftExploreData(params, req));
};

export default {
  loadData,
  component: withStyles(s)(Explore)
};

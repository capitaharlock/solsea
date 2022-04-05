import React, { useEffect, useRef, useState } from "react";
import client from "../../services/feathers";
import s from "./Collections.scss";
import CollectionItem from "../../components/CollectionItem/CollectionItem";
import Seo from "../../components/Seo/Seo";
import withStyles from "isomorphic-style-loader/withStyles";
import { getCollectionData, SET_COLLECTION } from "../../actions/pages";
import { useDispatch, useSelector } from "react-redux";
import CollectionFilters from "./CollectionFilters";
import { SET_TAGS } from "../../actions/tags";
import InfiniteScroll from "react-infinite-scroller";
import ContentLoader from "../../components/Loader/ContentLoader";
import { useClientLoading } from "../../hooks/useClientLoading";
import { useTranslation } from "react-i18next";

const Collections = () => {
  const { t } = useTranslation();
  const { collection, tags, total, isDarkMode, app } = useSelector(
    ({ collections, tags, app }) => ({
      collection: collections.collection,
      total: collections.total,
      tags: tags.tags,
      isDarkMode: app.isDarkMode,
      app
    })
  );
  const [query, setQuery] = useState({ verified: true });
  const [loading, setLoading] = useState(false);
  const [isInfiniteLoading, setInfiniteLoading] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!app.isInitialRender) {
      loadCollections();
    }
  }, [query]);

  const _timeout = useRef();

  const loadCollections = async (clear = true, offset = 0) => {
    clearTimeout(_timeout.current);
    if (clear) {
      setLoading(true);
    } else {
      setInfiniteLoading(true);
    }

    _timeout.current = setTimeout(async () => {
      try {
        const res = await client.service("collections").find({
          query: {
            visible: true,
            $limit: 21,
            $skip: offset,
            $sort: { createdAt: -1 },
            ...query,
            $populate: ["headerImage", "iconImage"]
          }
        });
        dispatch({
          type: SET_COLLECTION,
          payload: {
            data: res.data,
            clear,
            total: res.total
          }
        });
        setInfiniteLoading(false);
        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    }, 500);
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

  useClientLoading({
    load: loadTags,
    isInitialRender: app.isInitialRender
  });

  return (
    <div>
      <Seo title={`Solsea | ${t("seo.collections")}`} />

      <section
        aria-label="section"
        className={`banner-lower-margin ${
          isDarkMode ? "dark-lighter" : "light-white"
        } profile-banner d-flex`}
      >
        <div className="container">
          <div className={`row`}>
            <h1>{t("collections.exploreCollections")}</h1>
            <div className={`${s.collectionFilters} col-lg-12 mb-3`}>
              <CollectionFilters
                tags={tags}
                setQuery={setQuery}
                query={query}
                total={total}
              />
            </div>
          </div>
        </div>
      </section>
      <div>
        <div className="container page-wrapper">
          <div className={`row`}>
            <div className={`col-lg-12 position-relative ${s.container}`}>
              {loading ? (
                <ContentLoader />
              ) : collection.length > 0 ? (
                <InfiniteScroll
                  pageStart={0}
                  loadMore={() => {
                    if (!loading && !isInfiniteLoading) {
                      loadCollections(false, collection.length);
                    }
                  }}
                  hasMore={collection.length < total}
                  threshold={250}
                  className={`${s.exploreCollection} row`}
                >
                  {collection.map(collection => (
                    <div
                      key={collection._id}
                      className={`d-flex col-lg-4 col-md-6 col-sm-6 col-xs-12 ${s.item}`}
                    >
                      <CollectionItem {...collection} displayDate={false} />
                    </div>
                  ))}
                  <div
                    style={{
                      height: "100px",
                      width: "100%",
                      position: "relative"
                    }}
                  >
                    {loading && collection.length > 0 && <ContentLoader />}
                  </div>
                </InfiniteScroll>
              ) : (
                <div style={{ fontSize: "24px" }}>
                  <p>{t("collections.noCollectionMatchingCriteria")}</p>
                </div>
              )}
            </div>
            <div
              style={{ height: "100px", width: "100%", position: "relative" }}
            >
              {isInfiniteLoading && collection.length > 0 && <ContentLoader />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const loadData = (store, params, query, path, req) => {
  return store.dispatch(getCollectionData(params, req));
};

export default { loadData, component: withStyles(s)(Collections) };

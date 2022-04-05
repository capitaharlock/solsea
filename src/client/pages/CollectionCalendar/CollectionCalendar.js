import React, { useEffect, useState } from "react";
import client from "../../services/feathers";
import s from "./CollectionCalendar.scss";
import Seo from "../../components/Seo/Seo";
import withStyles from "isomorphic-style-loader/withStyles";
import {
  getCalendarCollectionData,
  SET_CALENDAR_COLLECTION
} from "../../actions/pages";
import { useClientLoading } from "../../hooks/useClientLoading";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/Loader/Loader";
import CalendarFilters from "./CalendarFilters";
import { SET_TAGS } from "../../actions/tags";
import CalendarItem from "../../components/CalendarItem/CalendarItem";
import { useTranslation } from "react-i18next";

const CollectionCalendar = () => {
  const { t } = useTranslation();
  const { collection = {}, tags = [], total, isDarkMode, app } = useSelector(
    ({ collections, tags, app }) => ({
      collection: collections.calendarCollections,
      total: collections.total,
      tags: tags.tags,
      isDarkMode: app.isDarkMode,
      app
    })
  );

  const dispatch = useDispatch();
  const [query, setQuery] = useState({});

  useEffect(() => {
    if (!app.isInitialRender) {
      loadCollections();
    }
  }, [query]);

  const loadCollections = async () => {
    try {
      const res = await client.service("collections").find({
        query: {
          visible: true,
          mintedDate: { $gte: new Date().toISOString() },
          $sort: {
            mintedDate: 1
          },
          ...query,
          $populate: ["headerImage", "iconImage"]
        }
      });

      dispatch({
        type: SET_CALENDAR_COLLECTION,
        payload: res.data
      });
    } catch (error) {
      /**/
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

  useClientLoading({
    load: loadTags,
    isInitialRender: app.isInitialRender
  });

  const isLoading = useClientLoading({
    load: loadCollections,
    isInitialRender: app.isInitialRender,
    params: {}
  });
  return (
    <div>
      <Seo title={`Solsea | ${t("seo.collectionCalendar")}`} />

      <section
        aria-label="section"
        className={`${s.banner} ${
          isDarkMode ? "dark-lighter" : "light-white"
        } profile-banner d-flex`}
      >
        <h1>{t("collections.calendar")}</h1>
      </section>
      <div className={`banner ${isDarkMode ? "dark-lighter" : "light-white"}`}>
        <div className={`container`}>
          <div className={`${s.collectionFilters} col-lg-12 mb-3`}>
            <CalendarFilters
              tags={tags}
              setQuery={setQuery}
              query={query}
              total={total}
            />
          </div>
        </div>
      </div>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="container page-wrapper">
          <div className="row">
            {collection.map(collection => (
              <div
                key={collection._id}
                className={`d-flex col-lg-4 col-md-6 col-sm-6 col-xs-12 ${s.item}`}
              >
                <CalendarItem
                  key={collection._id}
                  {...collection}
                  displayDate={true}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const loadData = (store, params, query, path, req) => {
  return store.dispatch(getCalendarCollectionData(params, req));
};

export default { loadData, component: withStyles(s)(CollectionCalendar) };

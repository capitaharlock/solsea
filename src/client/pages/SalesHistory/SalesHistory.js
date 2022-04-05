import React, { useEffect, useState, useRef } from "react";
import client from "../../services/feathers";
import s from "./SalesHistory.scss";
import Seo from "../../components/Seo/Seo";
import withStyles from "isomorphic-style-loader/withStyles";
import { useDispatch, useSelector } from "react-redux";
import InfiniteScroll from "react-infinite-scroller";
import ContentLoader from "../../components/Loader/ContentLoader";
import { useHistory } from "react-router";
import { loadHistory, SET_SALES_HISTORY } from "../../actions/saleshistory";
import SaleHistoryItem from "../../components/SaleHistoryItem/SaleHistoryItem";
import { useTranslation } from "react-i18next";

const SalesHistory = () => {
  const { t } = useTranslation();
  const { saleshistory, total, app } = useSelector(({ saleshistory, app }) => ({
    saleshistory: saleshistory.saleshistory,
    total: saleshistory.total,
    app
  }));

  const history = useHistory();
  const dispatch = useDispatch();

  const [firstLoad, setFirstLoad] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isInfiniteLoading, setInfiniteLoading] = useState(false);
  const [count, setCount] = useState(total);

  useEffect(() => {
    if (!app.isInitialRender && history.action === "PUSH") {
      loadSalesHistory(true);
    } else {
      setFirstLoad(false);
    }
  }, []);

  const _timeout = useRef();

  const loadSalesHistory = async (clear = true, offset = 0) => {
    clearTimeout(_timeout.current);
    if (clear) {
      setLoading(true);
    } else {
      setInfiniteLoading(true);
    }

    _timeout.current = setTimeout(async () => {
      try {
        const res = await client.service("listed-archive").find({
          query: {
            status: "SOLD",
            $sort: {
              createdAt: -1
            },
            $limit: 40
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
    }, 500);
  };

  return (
    <div>
      <Seo title={`Solsea | ${t("seo.salesHistory")}`} />
      <section aria-label="section" className={`banner profile-banner d-flex`}>
        <div className="container">
          <div className="row">
            <h1>{t("sales.title")}</h1>
          </div>
        </div>
      </section>
      <div className="container page-wrapper">
        <div className="row">
          <div className={`col-lg-12 position-relative ${s.container}`}>
            {loading ? (
              <ContentLoader />
            ) : saleshistory && saleshistory.length > 0 ? (
              <InfiniteScroll
                pageStart={0}
                loadMore={() => {
                  if (!loading) {
                    loadSalesHistory(false, saleshistory.length);
                  }
                }}
                hasMore={saleshistory.length < count}
                threshold={250}
                className={` ${s.exploreNft}`}
              >
                {saleshistory.map((nft, index) => (
                  <div
                    key={index}
                    className={`d-flex col-lg-3 col-md-6 col-sm-6 col-xs-12 ${s.exploreNft}`}
                  >
                    <SaleHistoryItem {...nft} />
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
          <div style={{ height: "100px", width: "100%", position: "relative" }}>
            {isInfiniteLoading && saleshistory.length > 0 && <ContentLoader />}
          </div>
        </div>
      </div>
    </div>
  );
};

const loadData = (store, params, query, path, req) => {
  return store.dispatch(loadHistory(params, req));
};

export default {
  loadData,
  component: withStyles(s)(SalesHistory)
};

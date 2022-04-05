import React, { useEffect, useLayoutEffect, useState } from "react";
import client from "../../services/feathers";
import s from "./CollectionStatistics.scss";
import Seo from "../../components/Seo/Seo";
import withStyles from "isomorphic-style-loader/withStyles";
import { getCollectionStatistics } from "../../actions/pages";
import { useDispatch, useSelector } from "react-redux";
import ContentLoader from "../../components/Loader/ContentLoader";
import { useClientLoading } from "../../hooks/useClientLoading";
import { SET_COLLECTION_STATISTICS } from "../../actions/collection-statistics";
import StatisticsTable from "../../components/StatisticsTable/StatisticsTable";
import { isMobile } from "react-device-detect";
import { useTranslation } from "react-i18next";
import { CONTENT_URL } from "../../../api/Definitions";
import { Link } from "react-router-dom";
import { parseNFTPrice } from "../../hooks/parsePrice";
import { SystemProgram } from "@solana/web3.js";
import useHistorySnapshot from "../../hooks/useHistorySnapshot";
import { useHistory } from "react-router";

const CollectionStatistics = () => {
  const { t } = useTranslation();
  const { collectionStatistics, isDarkMode, app } = useSelector(
    ({ collectionStatistics, app }) => ({
      collectionStatistics: collectionStatistics.collectionStatistics,
      isDarkMode: app.isDarkMode,
      app
    })
  );
  const [query, setQuery] = useState({});
  const [loading, setLoading] = useState(false);
  const [pageIndex, setCurrPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const history = useHistory();

  const dispatch = useDispatch();

  useEffect(() => {
    if (!app.isInitialRender) {
      loadCollectionStatistics();
    }
  }, [query]);

  const [historySnapshotProcessed, setHistorySnapshotProcessed] = useState(
    false
  );

  const historySnapshot = useHistorySnapshot({
    query,
    pageSize,
    pageIndex
  });

  useLayoutEffect(() => {
    if (
      historySnapshot &&
      history.action === "POP" &&
      !historySnapshotProcessed
    ) {
      setQuery({ ...historySnapshot.snapshot.query });
      setPageSize(historySnapshot.snapshot.pageSize);
      setCurrPageIndex(historySnapshot.snapshot.pageIndex);
      setHistorySnapshotProcessed(true);
    }
  }, [loading]);

  const loadCollectionStatistics = async (clear = true, offset = 0) => {
    setLoading(true);
    try {
      const res = await client.service("collection-statistics").find({
        query: {
          dateRange: 1,
          ...query
        }
      });
      dispatch({
        type: SET_COLLECTION_STATISTICS,
        payload: {
          data: res,
          clear,
          total: 0
        }
      });
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  let columns = React.useMemo(
    () => [
      {
        Header: "Collection Statistics",
        columns: [
          {
            Header: "#",
            accessor: (row, index) => {
              return index + 1;
            },
            disableSortBy: true
          },
          {
            id: "nft_collection.iconImage",
            Header: t("statistics.icon"),
            accessor: row => {
              if (
                row &&
                row.nft_collection &&
                row.nft_collection.iconImage &&
                row.nft_collection.iconImage.s3 &&
                row.nft_collection.iconImage.s3.thumbnail
              )
                return CONTENT_URL + row.nft_collection.iconImage.s3.thumbnail;
              return "";
            },
            disableSortBy: true
          },
          {
            id: "nft_collection.title",
            Header: t("statistics.title"),
            accessor: row => {
              if (row && row.nft_collection && row.nft_collection.title) {
                return {
                  _id: row.nft_collection._id,
                  title: row.nft_collection.title
                };
              }
              return {};
            },
            // eslint-disable-next-line react/display-name
            Cell: cell => {
              return (
                <Link
                  className={`${s.linkItem}`}
                  to={`/collection/${cell.value._id}`}
                >
                  {cell.value.title}
                </Link>
              );
            },
            disableSortBy: true
          },
          {
            id: "maxPrice",
            Header: t("statistics.volume"),
            accessor: row => {
              const price = parseNFTPrice(
                row.maxPrice,
                SystemProgram.programId.toString()
              );
              return `${price.price} ${price.currency}`;
            },
            sortType: (rowA, rowB, id, desc) => {
              if (rowA.original[id] > rowB.original[id]) return -1;
              if (rowB.original[id] < rowA.original[id]) return 1;
              return 0;
            }
          },
          {
            Header: t("statistics.sales"),
            accessor: "count"
          },
          {
            id: "avgAmmount",
            Header: t("statistics.avgPrice"),
            accessor: row => {
              const price = parseNFTPrice(
                row.avgAmmount,
                SystemProgram.programId.toString()
              );
              return `${price.price} ${price.currency}`;
            },
            sortType: (rowA, rowB, id, desc) => {
              if (rowA.original[id] > rowB.original[id]) return -1;
              if (rowB.original[id] < rowA.original[id]) return 1;
              return 0;
            }
          },
          {
            id: "nft_collection.floorPrice",
            Header: t("statistics.floor"),
            accessor: row => {
              if (row && row.nft_collection && row.nft_collection.floorPrice) {
                const price = parseNFTPrice(
                  row.nft_collection.floorPrice,
                  SystemProgram.programId.toString()
                );
                return `${price.price} ${price.currency}`;
              }
              return "";
            },
            sortType: (rowA, rowB, id, desc) => {
              if (
                !rowA.original ||
                !rowA.original.nft_collection ||
                !rowA.original.nft_collection.floorPrice
              )
                return 1;
              if (
                !rowB.original ||
                !rowB.original.nft_collection ||
                !rowB.original.nft_collection.floorPrice
              )
                return -1;
              if (
                rowA.original.nft_collection.floorPrice >
                rowB.original.nft_collection.floorPrice
              )
                return -1;
              if (
                rowB.original.nft_collection.floorPrice <
                rowA.original.nft_collection.floorPrice
              )
                return 1;
              return 0;
            }
          },
          {
            Header: t("statistics.assets"),
            accessor: "nft_collection.nftCount"
          }
        ]
      }
    ],
    []
  );

  const columnsMobile = React.useMemo(
    () => [
      {
        Header: "Collection Statistics",
        columns: [
          {
            Header: "#",
            accessor: (row, index) => {
              return index + 1;
            }
          },
          {
            id: "nft_collection.iconImage",
            Header: t("statistics.icon"),
            accessor: row => {
              if (
                row &&
                row.nft_collection &&
                row.nft_collection.iconImage &&
                row.nft_collection.iconImage.s3 &&
                row.nft_collection.iconImage.s3.thumbnail
              )
                return CONTENT_URL + row.nft_collection.iconImage.s3.thumbnail;
              return "";
            }
          },
          {
            id: "nft_collection.title",
            Header: t("statistics.title"),
            accessor: row => {
              if (row && row.nft_collection && row.nft_collection.title) {
                // console.log("row", row.nft_collection.title);
                return {
                  _id: row.nft_collection._id,
                  title: row.nft_collection.title
                };
              }
              return {};
            },
            // eslint-disable-next-line react/display-name
            Cell: cell => {
              return (
                <Link
                  className={`${
                    isDarkMode ? "dark-collection-stats-title" : s.linkItem
                  }`}
                  to={`/collection/${cell.value._id}`}
                >
                  {cell.value.title}
                </Link>
              );
            }
          },
          {
            id: "maxPrice",
            Header: t("statistics.volume"),
            accessor: row => {
              const price = parseNFTPrice(
                row.maxPrice,
                SystemProgram.programId.toString()
              );
              return `${price.price} ${price.currency}`;
            },
            sortType: (rowA, rowB, id, desc) => {
              if (rowA.original[id] > rowB.original[id]) return -1;
              if (rowB.original[id] < rowA.original[id]) return 1;
              return 0;
            }
          }
        ]
      }
    ],
    []
  );

  useClientLoading({
    load: loadCollectionStatistics,
    isInitialRender: app.isInitialRender,
    params: {}
  });

  return (
    <div>
      <Seo title={`Solsea | ${t("statistics.statistics")}`} />
      <section
        aria-label="section"
        className={`${
          isDarkMode ? "dark-lighter" : "light-white"
        } banner profile-banner d-flex`}
      >
        <div className="container">
          <h1>{t("statistics.topCollections")}</h1>
        </div>
      </section>
      <div className={`container page-wrapper ${s.containerForTable}`}>
        <div className={`col-lg-12 position-relative ${s.container}`}>
          {loading ? (
            <ContentLoader />
          ) : (
            <>
              <StatisticsTable
                columns={isMobile ? columnsMobile : columns}
                data={collectionStatistics}
                setQuery={setQuery}
                currPageIndex={pageIndex}
                currPageSize={pageSize}
                setCurrPageSize={setPageSize}
                setCurrPageIndex={setCurrPageIndex}
                query={query}
              />
              <div
                style={{
                  height: "100px",
                  width: "100%",
                  position: "relative"
                }}
              >
                {loading && collectionStatistics.length > 0 && (
                  <ContentLoader />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const loadData = (store, params, query, path, req) => {
  return store.dispatch(getCollectionStatistics(params, req));
};

export default { loadData, component: withStyles(s)(CollectionStatistics) };

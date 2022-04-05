import useStyles from "isomorphic-style-loader/useStyles";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { usePagination, useSortBy, useTable } from "react-table";
import CollectionStatisticsFilter from "../CollectionStatisticsFilter/CollectionStatisticsFilter";
import StatisticsRow from "../StatisticsRow/StatisticsRow";
import s from "./StatisticsTable.scss";
import ReactTooltip from "react-tooltip";

const StatisticsTable = ({
  columns,
  data,
  setQuery,
  currPageSize,
  currPageIndex,
  setCurrPageSize,
  setCurrPageIndex,
  query
}) => {
  const { t } = useTranslation();
  useStyles(s);

  const [timeRange, setTimeRange] = useState("");

  const { isDarkMode } = useSelector(({ app }) => ({
    isDarkMode: app.isDarkMode
  }));

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize }
  } = useTable(
    {
      columns,
      data,
      initialState: {
        pageIndex: currPageIndex,
        pageSize: currPageSize,
        sortBy: [
          {
            id: "maxPrice",
            desc: false
          }
        ]
      }
    },
    useSortBy,
    usePagination
  );

  useEffect(() => {
    switch (query.dateRange) {
      case 1:
        setTimeRange("24h");
        break;
      case 7:
        setTimeRange("7d");
        break;
      case 30:
        setTimeRange("30d");
        break;
      case -1:
        setTimeRange("All");
        break;
      default:
        break;
    }
  }, [query]);

  return (
    <>
      <CollectionStatisticsFilter
        setQuery={setQuery}
        query={query}
        pageIndex={pageIndex}
        pageOptions={pageOptions}
        data={data}
        previousPage={previousPage}
        canPreviousPage
        gotoPage={gotoPage}
        nextPage={nextPage}
        pageCount={pageCount}
        canNextPage={canNextPage}
        setPageSize={setPageSize}
        pageSize={pageSize}
        topBar={true}
        setCurrPageSize={setCurrPageSize}
        setCurrPageIndex={setCurrPageIndex}
      />
      {data.length > 0 ? (
        <>
          <table className={`${s.tableContainer}`} {...getTableProps()}>
            <thead className={`${s.tableHead}`}>
              <tr
                className={`${s.statsRow} ${
                  isDarkMode ? "dark-page-table-header" : ""
                }`}
                {...headerGroups[0].getHeaderGroupProps()}
              >
                {headerGroups[1].headers.map((column, i) => (
                  <th
                    className={`${s.tableHeader} ${isDarkMode ? "dark" : ""}`}
                    key={i}
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                  >
                    {i !== 1 && (
                      <>
                        {(i === 3 || i === 4 || i === 5) && (
                          <span className={`${s.timeRange}`}>
                            {timeRange ? timeRange : "24h"}
                          </span>
                        )}
                        {/* <span>{column.render("Header")}</span> */}
                        {i === 0 && (
                          <span className={`${s.title}`}>
                            {column.render("Header")}
                          </span>
                        )}
                        {i === 1 && (
                          <span className={`${s.title}`}>
                            {column.render("Header")}
                          </span>
                        )}
                        {i === 2 && (
                          <span className={`${s.title}`}>
                            {column.render("Header")}
                          </span>
                        )}
                        {i === 3 && (
                          <span
                            className={`${s.title}`}
                            data-tip={t("statistics.volumeToolTip")}
                          >
                            {column.render("Header")}
                          </span>
                        )}
                        {i === 4 && (
                          <span
                            className={`${s.title}`}
                            data-tip={t("statistics.salesToolTip")}
                          >
                            {column.render("Header")}
                          </span>
                        )}
                        {i === 5 && (
                          <span
                            className={`${s.title}`}
                            data-tip={t("statistics.avgPriceToolTip")}
                          >
                            {column.render("Header")}
                          </span>
                        )}
                        {i === 6 && (
                          <span
                            className={`${s.title}`}
                            data-tip={t("statistics.floorToolTip")}
                          >
                            {column.render("Header")}
                          </span>
                        )}
                        {i === 7 && (
                          <span
                            className={`${s.title}`}
                            data-tip={t("statistics.itemsToolTip")}
                          >
                            {column.render("Header")}
                          </span>
                        )}
                        <span className={`${s.sortTable}`}>
                          {column.isSorted ? (
                            column.isSortedDesc ? (
                              <>
                                {" "}
                                <i className={`fa fa-caret-up`}></i>
                              </>
                            ) : (
                              <>
                                {" "}
                                <i className={`fa fa-caret-down`}></i>
                              </>
                            )
                          ) : (
                            <i>&nbsp;&nbsp;&nbsp;</i>
                          )}
                        </span>
                      </>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody
              className={`${s.tableBody} ${
                isDarkMode ? "dark-table-body" : ""
              }`}
              {...getTableBodyProps()}
            >
              {page.map((row, i) => {
                prepareRow(row);
                return (
                  <StatisticsRow
                    key={i}
                    row={row}
                    index={i}
                    pageIndex={pageIndex}
                    pageSize={currPageSize}
                  />
                );
              })}
            </tbody>
          </table>
          <CollectionStatisticsFilter
            setQuery={setQuery}
            query={query}
            pageIndex={pageIndex}
            pageOptions={pageOptions}
            data={data}
            previousPage={previousPage}
            canPreviousPage
            gotoPage={gotoPage}
            nextPage={nextPage}
            pageCount={pageCount}
            canNextPage={canNextPage}
            setPageSize={setPageSize}
            pageSize={pageSize}
            topBar={false}
            setCurrPageSize={setCurrPageSize}
            setCurrPageIndex={setCurrPageIndex}
          />
          <ReactTooltip
            place="top"
            effect="solid"
            multiline={true}
            className={`${isDarkMode ? "dark-tool-tip" : "tool-tip"}`}
          />
        </>
      ) : (
        <div style={{ fontSize: "24px", textAlign: "center" }}>
          <p>{t("collections.noCollectionMatchingCriteria")}</p>
        </div>
      )}
    </>
  );
};

export default StatisticsTable;

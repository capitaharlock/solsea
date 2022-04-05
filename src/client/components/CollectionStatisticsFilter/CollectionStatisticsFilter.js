import withStyles from "isomorphic-style-loader/withStyles";
import React, { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import Select from "react-select";
import { statisticsTimeRange, statsPageSize } from "../../../api/Definitions";
import s from "./CollectionStatisticsFilter.scss";

const CollectionStatisticsFilter = ({
  setQuery,
  query,
  pageIndex,
  pageOptions,
  data,
  previousPage,
  canPreviousPage,
  gotoPage,
  nextPage,
  pageCount,
  canNextPage,
  setPageSize,
  pageSize,
  topBar,
  setCurrPageSize,
  setCurrPageIndex
}) => {
  const { t } = useTranslation();
  const { isDarkMode } = useSelector(({ app }) => ({
    isDarkMode: app.isDarkMode
  }));
  const [defaultSort, setDefaultSort] = useState({ value: 1, label: "24h" });
  const [defaultPageSize, setDefaultPageSize] = useState({
    value: 10,
    label: "10"
  });

  // useEffect(() => {
  //   setCurrPageIndex(pageIndex);
  // }, [pageIndex]);

  const onSortChange = e => {
    const q = e.value;
    setQuery({
      ...query,
      ...q
    });
  };

  const onPageSizeChange = e => {
    setCurrPageSize(e.value.pageSize);
    setPageSize(e.value.pageSize);
  };

  useEffect(() => {
    if (query.dateRange) {
      const newValue = statisticsTimeRange.find(
        v => v.value.dateRange === query.dateRange
      );
      if (newValue) {
        setDefaultSort(newValue);
      }
    }
  }, [query]);

  // useEffect(() => {
  //   if (pageSize) {
  //     const newValue = statsPageSize.find(v => v.value.pageSize === pageSize);
  //     if (newValue) {
  //       setDefaultPageSize(newValue);
  //     }
  //   }
  // }, []);

  const selectDarkMode = {
    menu: () => ({
      backgroundColor: isDarkMode ? "#1f212e" : "#fff",
      border: isDarkMode ? "1px solid #dddddd40" : "1px solid #ddd",
      borderRadius: "0.25rem",
      color: isDarkMode ? "#808080" : "#251552",
      position: "absolute",
      zIndex: "1000",
      width: "100%"
    }),
    control: () => ({
      backgroundColor: isDarkMode ? "#1f212e" : "#fff",
      border: isDarkMode ? "1px solid #dddddd40" : "1px solid #ddd",
      borderRadius: "0.25rem",
      display: "flex",
      cursor: "pointer"
    }),
    singleValue: () => ({
      backgroundColor: isDarkMode ? "#1f212e" : "#fff",
      color: isDarkMode ? "#f4f7fcbb" : "#251552"
    }),
    placeholder: () => ({
      backgroundColor: isDarkMode ? "#1f212e" : "#fff",
      color: isDarkMode ? "#f4f7fcbb" : "#251552"
    }),
    option: base => ({
      ...base,
      "&:hover": {
        backgroundColor: isDarkMode ? "#5c287c" : "#e9ecef"
      },
      backgroundColor: isDarkMode ? "#1f212e" : "#fff",
      color: isDarkMode ? "#f4f7fcbb" : ""
    })
  };

  return (
    <div className={`${s.paginationContainer} d-flex`}>
      <div className={`col-lg-12 ${s.pagination}`}>
        <div className={`col-lg-4 ${s.paginationInfoHolder}`}>
          {topBar ? (
            <div className={`${s.filterContainer} d-flex align-items-center`}>
              <div className={s.filtersGroup}>
                <div className={s.filters}>
                  <div className={`dropdown ${s.dropdown}`}>
                    <Select
                      defaultValue={defaultSort}
                      name="sort"
                      value={defaultSort}
                      onChange={onSortChange}
                      options={statisticsTimeRange}
                      controlShouldRenderValue
                      className="basic-multi-select"
                      classNamePrefix="select"
                      placeholder={t("filters.sortBy")}
                      styles={selectDarkMode}
                      getOptionLabel={e => t(e.label) || ""}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <span>
              {!isMobile
                ? `${t("statistics.showing")} ${pageSize * pageIndex + 1} - ${
                    pageIndex + 1 === pageCount
                      ? data.length
                      : pageSize * (pageIndex + 1)
                  } ${t("statistics.outOf")} ${data.length}`
                : `${pageSize * pageIndex + 1} - ${
                    pageIndex + 1 === pageCount
                      ? data.length
                      : pageSize * (pageIndex + 1)
                  } ${t("statistics.outOf")} ${data.length}`}
            </span>
          )}
        </div>
        {pageCount ? (
          <div className={`col-lg-4 ${s.paginationControlsHolder}`}>
            {!isMobile && <span>{t("statistics.page")}</span>}
            {pageIndex > 0 ? (
              <button
                className={`${s.pageButton} ${
                  isDarkMode ? "dark-mode-page-button" : ""
                }`}
                onClick={() => {
                  setCurrPageIndex(pageIndex - 1);
                  previousPage();
                }}
                disabled={!canPreviousPage}
              >
                <i className={`fa fa-chevron-left`}></i>
              </button>
            ) : (
              ""
            )}
            {!isMobile && (
              <>
                {pageIndex >= 2 && (
                  <button
                    className={`${isDarkMode ? "dark-mode-page-button" : ""}`}
                    onClick={() => {
                      gotoPage(0);
                      setCurrPageIndex(0);
                    }}
                  >
                    {1}
                  </button>
                )}
                {pageIndex >= 2 && <span>...</span>}
                {pageIndex > 0 && (
                  <button
                    className={`${isDarkMode ? "dark-mode-page-button" : ""}`}
                    onClick={() => {
                      gotoPage(pageIndex - 1);
                      setCurrPageIndex(pageIndex - 1);
                    }}
                  >
                    {pageIndex}
                  </button>
                )}
                <button
                  className={`${s.selectedButton} ${
                    isDarkMode ? "dark-mode-page-button-selected" : ""
                  }`}
                  onClick={() => {
                    gotoPage(pageIndex);
                    setCurrPageIndex(pageIndex);
                  }}
                >
                  {pageIndex + 1}
                </button>
                {pageIndex + 2 === pageCount ? (
                  ""
                ) : (
                  <button
                    className={`${isDarkMode ? "dark-mode-page-button" : ""}`}
                    onClick={() => {
                      gotoPage(pageIndex + 1);
                      setCurrPageIndex(pageIndex + 1);
                    }}
                    disabled={pageIndex + 1 >= pageCount}
                  >
                    {pageIndex + 2}
                  </button>
                )}
                {/* <button
                  className={`${isDarkMode ? "dark-mode-page-button" : ""}`}
                  onClick={() => gotoPage(pageIndex + 2)}
                  disabled={pageIndex + 2 >= pageCount}
                >
                  {pageIndex + 3}
                </button> */}
                {pageIndex + 2 >= pageCount ? "" : <span>...</span>}
                {pageIndex + 1 === pageCount ? (
                  ""
                ) : (
                  <>
                    {/* <span>...</span> */}
                    <button
                      className={`${isDarkMode ? "dark-mode-page-button" : ""}`}
                      onClick={() => {
                        gotoPage(pageCount - 1);
                        setCurrPageIndex(pageCount - 1);
                      }}
                    >
                      {pageCount}
                    </button>
                  </>
                )}
              </>
            )}
            <button
              className={`${isDarkMode ? "dark-mode-page-button" : ""}`}
              onClick={() => {
                gotoPage(pageIndex + 1);
                setCurrPageIndex(pageIndex + 1);
              }}
              disabled={!canNextPage}
            >
              <i className={`fa fa-chevron-right`}></i>
            </button>
          </div>
        ) : (
          ""
        )}
        <div className={`col-lg-4 ${s.columnLimitHolder}`}>
          {!isMobile && (
            <span className={`${s.row}`}>{t("statistics.row")}</span>
          )}
          <Select
            defaultValue={defaultPageSize}
            name="sort"
            onChange={onPageSizeChange}
            options={statsPageSize}
            controlShouldRenderValue
            className="basic-multi-select"
            classNamePrefix="select"
            placeholder={`${t("filters.show")} ${pageSize}`}
            styles={selectDarkMode}
            value={pageSize}
          />
        </div>
      </div>
      {pageCount ? (
        <div className={`${s.paginationMobile}`}>
          {pageIndex > 0 ? (
            <button
              className={`${s.pageButton} ${
                isDarkMode ? "dark-mode-page-button" : ""
              }`}
              onClick={() => previousPage()}
              disabled={!canPreviousPage}
            >
              <i className={`fa fa-chevron-left`}></i>
            </button>
          ) : (
            ""
          )}
          {/* {!isMobile && ( */}
          <>
            {pageIndex >= 2 && (
              <button
                className={`${isDarkMode ? "dark-mode-page-button" : ""}`}
                onClick={() => gotoPage(0)}
              >
                {1}
              </button>
            )}
            {pageIndex >= 2 && <span>...</span>}
            {pageIndex > 0 && (
              <button
                className={`${isDarkMode ? "dark-mode-page-button" : ""}`}
                onClick={() => gotoPage(pageIndex - 1)}
              >
                {pageIndex}
              </button>
            )}
            <button
              className={`${s.selectedButton} ${
                isDarkMode ? "dark-mode-page-button-selected" : ""
              }`}
              onClick={() => gotoPage(pageIndex)}
            >
              {pageIndex + 1}
            </button>
            {pageIndex + 2 === pageCount ? (
              ""
            ) : (
              <button
                className={`${isDarkMode ? "dark-mode-page-button" : ""}`}
                onClick={() => gotoPage(pageIndex + 1)}
                disabled={pageIndex + 1 >= pageCount}
              >
                {pageIndex + 2}
              </button>
            )}
            {/* <button
                  className={`${isDarkMode ? "dark-mode-page-button" : ""}`}
                  onClick={() => gotoPage(pageIndex + 2)}
                  disabled={pageIndex + 2 >= pageCount}
                >
                  {pageIndex + 3}
                </button> */}
            {pageIndex + 2 >= pageCount ? "" : <span>...</span>}
            {pageIndex + 1 === pageCount ? (
              ""
            ) : (
              <>
                <button
                  className={`${isDarkMode ? "dark-mode-page-button" : ""}`}
                  onClick={() => gotoPage(pageCount - 1)}
                >
                  {pageCount}
                </button>
              </>
            )}
          </>
          {/* )} */}
          <button
            className={`${isDarkMode ? "dark-mode-page-button" : ""}`}
            onClick={() => nextPage()}
            disabled={!canNextPage}
          >
            <i className={`fa fa-chevron-right`}></i>
          </button>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default withStyles(s)(CollectionStatisticsFilter);

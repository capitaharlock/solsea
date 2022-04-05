import withStyles from "isomorphic-style-loader/withStyles";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import Select from "react-select";
import {
  collectionSortOptions,
  listedCountOptions
} from "../../../api/Definitions";
import s from "./CollectionFilters.scss";
import { useTranslation } from "react-i18next";

const CollectionFilters = ({ tags, setQuery, query, total }) => {
  const { isDarkMode } = useSelector(({ app }) => ({
    isDarkMode: app.isDarkMode
  }));
  const { t } = useTranslation();
  const [text, setText] = useState("");
  let selectedTags = [];
  const [tagValues, setTagValues] = useState([]);
  const [tagDefaultValues, setTagDefaultValues] = useState([]);

  const textRef = useRef(null);
  const onTextSearch = e => {
    const input = e.currentTarget.value;
    setText(input);
    if (input && input !== "") {
      setQuery({
        ...query,
        title: { $regex: `\\b${input}`, $options: "i" }
      });
    } else {
      if (query) {
        delete query["title"];
        setQuery({
          ...query
        });
      } else {
        setQuery({});
      }
    }
  };

  useEffect(() => {
    loadTags();
    setQuery({
      ...query,
      nftCount: { $gt: 5 }
    });
  }, [tags]);

  async function loadTags() {
    if (tags && tags.data && tags.data.length > 0) {
      const allTags = [];
      tags.data.forEach(e => {
        allTags.push({
          value: e.name,
          label: e.name
        });
      });
      setTagValues(allTags);
    }
  }

  function onTagChange(data) {
    if (data && data.length > 0) {
      selectedTags = data.map(t => {
        return t.value;
      });
      setQuery({
        ...query,
        tags: { $all: selectedTags }
      });
    } else {
      delete query["tags"];

      setQuery({
        ...query
      });
    }
    setTagDefaultValues(data);
  }

  function onCategorySelect(e) {
    selectedTags.push({ value: e, label: e });
    onTagChange(selectedTags);
  }

  const onSortChange = e => {
    const q = e.value;
    setQuery({
      ...query,
      $sort: { ...q }
    });
  };

  const onLimitChange = e => {
    if (e && e.value) {
      const q = e.value;

      if (q > 0) {
        setQuery({
          ...query,
          nftCount: { $gt: q }
        });
      } else {
        delete query["nftCount"];
        setQuery({
          ...query
        });
      }
    } else {
      delete query["nftCount"];
      setQuery({
        ...query
      });
    }
  };

  const onVerifiedChange = e => {
    const val = e.target.checked;

    if (val) {
      setQuery({
        ...query,
        verified: true
      });
    } else {
      delete query["verified"];
      setQuery({ ...query });
    }
  };

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
      backgroundColor: isDarkMode ? "#242634" : "#fff",
      color: isDarkMode ? "#f4f7fcbb" : ""
    })
  };

  return (
    <div>
      <div className={`${s.searchContainer} d-flex align-items-center`}>
        <div className={s.searchInput}>
          <input
            ref={textRef}
            onChange={onTextSearch}
            type="text"
            value={text}
            placeholder={t("filters.searchByCollection")}
          />
          {text && text.length > 0 ? (
            <div
              className={`${s.searchButton}`}
              onClick={() => {
                onTextSearch({ currentTarget: { value: "" } });
                if (textRef && textRef.current) textRef.current.focus();
              }}
            >
              <i className="fa fa-close"></i>
            </div>
          ) : (
            <div className={`${s.searchButton}`}>
              <div className={s.searchIconContainer}>
                <img src="/assets/searchIcon.svg" />
              </div>
            </div>
          )}
        </div>
        <div className={s.categoriesHolder}>
          {/* <div
            className={`${s.categoryButton}`}
            onClick={() => onCategorySelect("Hot")}
          >
            <img
              className={s.icon}
              src="/assets/hotIcon.svg"
              title="Hot"
              loading="auto"
              alt="logo"
            />
            <span>{t("filters.hot")}</span>
          </div> */}
          <div
            className={`${s.categoryButton}`}
            onClick={() => onCategorySelect("3D")}
          >
            <img
              className={s.icon}
              src="/assets/3dIcon.svg"
              title="3D"
              loading="auto"
              alt="logo"
            />
            <span className={s.categoryText}>{t("filters.3d")}</span>
          </div>
          {/* <div
            className={`${s.categoryButton}`}
            onClick={() => onCategorySelect("Blue Chips")}
          >
            <img
              className={s.icon}
              src="/assets/blueChips.svg"
              title="Blue Chips"
              loading="auto"
              alt="logo"
            />
            <span>{t("filters.blueChips")}</span>
          </div> */}
          <div
            className={`${s.categoryButton}`}
            onClick={() => onCategorySelect("Art")}
          >
            <img
              className={s.icon}
              src="/assets/artIcon.svg"
              title="Art"
              loading="auto"
              alt="logo"
            />
            <span>{t("filters.art")}</span>
          </div>
          <div
            className={`${s.categoryButton}`}
            onClick={() => onCategorySelect("PFP")}
          >
            <img
              className={s.icon}
              src="/assets/pfpIcon.svg"
              title="PFP"
              loading="auto"
              alt="logo" />
            <span>{t("filters.pfp")}</span>
          </div>
          <div
            className={`${s.categoryButton}`}
            onClick={() => onCategorySelect("Painting")}
          >
            <img
              className={s.icon}
              src="/assets/paintingIcon.svg"
              title="Painting"
              loading="auto"
              alt="logo"
            />
            <span>{t("filters.painting")}</span>
          </div>
          <div
            className={`${s.categoryButton}`}
            onClick={() => onCategorySelect("Photography")}
          >
            <img
              className={s.icon}
              src="/assets/photographyIcon.svg"
              title="Photo"
              loading="auto"
              alt="logo"
            />
            <span>{t("filters.photography")}</span>
          </div>
          <div
            className={`${s.categoryButton}`}
            onClick={() => onCategorySelect("Collectible")}
          >
            <img
              className={s.icon}
              src="/assets/tradingCards.svg"
              title="Trading Cards"
              loading="auto"
              alt="logo"
            />
            <span>{t("filters.tradingCards")}</span>
          </div>
          <div
            className={`${s.categoryButton}`}
            onClick={() => onCategorySelect("Video")}
          >
            <img
              className={s.icon}
              src="/assets/videoIcon.svg"
              title="Picture"
              loading="auto"
              alt="logo"
            />
            <span>{t("filters.video")}</span>
          </div>
        </div>
        <h4 className={`${s.totalCounter}`}>
          {t("filters.totalItems")} {total || 0}
        </h4>
      </div>
      <div className={`${s.filterContainer} d-flex align-items-center`}>
        <div className={s.switchesGroup}>
          <div className={s.filtersSwitch}>
            <div className="form-check form-switch">
              <input
                className={`form-check-input ${
                  isDarkMode ? "dark-lighter-checkbox" : ""
                }`}
                type="checkbox"
                checked={query.verified ? true : false}
                onChange={onVerifiedChange}
              />
              <label
                className={`form-check-label ${isDarkMode ? "light-font" : ""}`}
                htmlFor="nsfw"
              >
                {t("filters.verified")}
              </label>
            </div>
          </div>
        </div>

        <div className={s.filtersGroup}>
          <div className={s.filters}>
            <div className={s.dropdown}>
              <Select
                // value={onLimitChange()}
                defaultValue={{ value: 5, label: "Listed NFTs > 5" }}
                name="sort"
                onChange={onLimitChange}
                options={listedCountOptions}
                controlShouldRenderValue
                className={`${s.multiSelect} basic-multi-select`}
                classNamePrefix="select"
                styles={selectDarkMode}
                getOptionLabel={e => t(e.label) || ""}
              />
            </div>
          </div>
          <div className={s.filters}>
            <div className={s.dropdown}>
              <Select
                // defaultValue={{ value: "default", label: "Sort by..." }}
                name="sort"
                onChange={onSortChange}
                options={collectionSortOptions}
                className="basic-multi-select"
                classNamePrefix="select"
                styles={selectDarkMode}
                query={query}
                placeholder={t("filters.sortBy")}
                getOptionLabel={e => t(e.label) || ""}
              />
            </div>
          </div>
          <div className={s.filters}>
            <div className={s.dropdown}>
              <Select
                isMulti
                name="colors"
                value={tagDefaultValues}
                onChange={onTagChange}
                options={tagValues}
                className="basic-multi-select"
                classNamePrefix="select"
                styles={selectDarkMode}
                placeholder={t("filters.selectTags")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withStyles(s)(CollectionFilters);

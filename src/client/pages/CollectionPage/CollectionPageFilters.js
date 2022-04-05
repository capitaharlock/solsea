import useStyles from "isomorphic-style-loader/useStyles";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import Select from "react-select";
import {
  hasNftCollectionOptions,
  nftSortOptions
} from "../../../api/Definitions";
import s from "./CollectionPageFilters.scss";
import { useTranslation } from "react-i18next";

const ExploreFilters = ({
  query,
  setQuery,
  tags,
  licenses,
  byCollection = true,
  isInline = false,
  total
}) => {
  const { isDarkMode } = useSelector(({ app }) => ({
    isDarkMode: app.isDarkMode
  }));
  let selectedTags = [];
  let selectedLicenses = [];

  const { t } = useTranslation();

  const timeoutId = useRef();
  const textRef = useRef(null);
  const [text, setText] = useState(
    query && query.Title ? query.Title.$regex : ""
  );
  const [tagValues, setTagValues] = useState([]);
  const [licenseValues, setLicensesValues] = useState([]);
  const [tagDefaultValues, setTagDefaultValues] = useState([]);

  const onTextSearch = e => {
    clearTimeout(timeoutId.current);
    const input = e.currentTarget.value;
    setText(input);
    timeoutId.current = setTimeout(() => {
      if (input && input !== "") {
        setQuery({
          ...query,
          Title: { $regex: `\\b${input}`, $options: "i" }
        });
      } else {
        delete query["Title"];
        setQuery({
          ...query
        });
      }
    }, 500);
  };

  const onSortChange = e => {
    const q = e.value;
    setQuery({
      ...query,
      $sort: { ...q }
    });
  };

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

  async function loadLicenses() {
    if (licenses && licenses.data && licenses.data.length > 0) {
      const allLicenses = [];
      licenses.data.forEach(e => {
        allLicenses.push({
          value: e.licenseUrl,
          label: e.title
        });
      });
      setLicensesValues(allLicenses);
    }
  }

  useEffect(() => {
    loadTags();
    loadLicenses();
  }, [query]);

  function onLicenseChange(data) {
    if (data && data.length > 0) {
      selectedLicenses = data.map(t => {
        return t.value;
      });
      setQuery({
        ...query,
        License_URL: { $in: selectedLicenses }
      });
    } else {
      delete query["License_URL"];

      setQuery({
        ...query
      });
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

  const onHasCollectionChange = e => {
    const q = e.value;
    if (Object.keys(q).length > 0) {
      setQuery({
        ...query,
        ...q
      });
    } else {
      delete query["nft_collection"];
      setQuery({ ...query });
    }
  };

  const onNSFWChange = e => {
    const val = e.target.checked;

    if (val) {
      delete query["nsfw"];
      setQuery({
        ...query,
        nsfw: { $in: [true, false] }
      });
    } else {
      setQuery({
        ...query,
        nsfw: false
      });
    }
  };

  const onValidatedChange = e => {
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

  const onNftPROChange = e => {
    const val = e.target.checked;
    if (val) {
      setQuery({
        ...query,
        isNFTPRO: { $exists: true }
      });
    } else {
      delete query["isNFTPRO"];
      setQuery({ ...query });
    }
  };

  const sortFilterDefaultValue = () => {
    if (query.$sort) {
      const option = nftSortOptions.find(item => {
        const fieldKey = Object.keys(item.value)[0];
        const fieldValue = Object.values(item.value)[0];
        if (
          query.$sort.hasOwnProperty(fieldKey) &&
          query.$sort[fieldKey] === fieldValue
        )
          return true;
        return false;
      });
      return option
        ? { ...option }
        : { value: "default", label: `${t("filters.sortBy")}` };
    } else {
      return { value: "default", label: `${t("filters.sortBy")}` };
    }
  };
  const collectionFilterDefaultValue = () => {
    if (query.nft_collection) {
      const fieldKey = Object.keys(query.nft_collection)[0];
      const option = hasNftCollectionOptions.find(item => {
        if (
          item.value.nft_collection &&
          item.value.nft_collection.hasOwnProperty(fieldKey)
        )
          return true;
        return false;
      });
      return option
        ? option
        : { value: "default", label: `${t("filters.singleCollection")}` };
    } else {
      return { value: "default", label: `${t("filters.singleCollection")}` };
    }
  };
  const tagsFilterDefaultValue = () => {
    if (query.tags && query.tags.$all) {
      return query.tags.$all.map(item => {
        return { label: item, value: item };
      });
    } else return [];
  };
  const licenseFilterDefaultValue = () => {
    if (query.License_URL && query.License_URL.$in) {
      return query.License_URL.$in.map(item => {
        const license = licenses.data.find(l => {
          if (l.licenseUrl === item) return true;
          return false;
        });
        return { label: license.title, value: item };
      });
    } else return [];
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
      backgroundColor: isDarkMode ? "#1f212e" : "#fff",
      color: isDarkMode ? "#f4f7fcbb" : ""
    })
  };

  useStyles(s);
  return (
    <div>
      {!isInline && (
        <>
          <div
            className={`${s.searchContainer} ${
              isDarkMode ? "dark-nft-border-bottom" : ""
            } d-flex align-items-center`}
          >
            <div className={s.searchInput}>
              <input
                ref={textRef}
                onChange={onTextSearch}
                type="text"
                value={text}
                placeholder={t("filters.searchByNft")}
                className={`${isDarkMode ? "dark-search" : "light-white"}`}
              />
              {text && text.length > 0 ? (
                <div
                  className={`${s.searchButton} ${
                    isDarkMode ? "dark-search" : ""
                  }`}
                  onClick={() => {
                    onTextSearch({ currentTarget: { value: "" } });
                    if (textRef && textRef.current) textRef.current.focus();
                  }}
                >
                  <i className="fa fa-close"></i>
                </div>
              ) : (
                <div
                  className={`${s.searchButton} ${
                    isDarkMode ? "dark-search" : ""
                  }`}
                >
                  <i className="fa fa-search"></i>
                </div>
              )}
            </div>
            <div className={s.categoriesHolder}>
              <div
                className={`${s.categoryButton}  ${
                  isDarkMode ? "dark-category-button" : "light-explore-nft"
                }`}
                onClick={() => onCategorySelect("3D")}
              >
                <img
                  src="/assets/3d.svg"
                  title="3D"
                  loading="auto"
                  alt="logo"
                />
                <span className={s.categoryText}>3D</span>
              </div>
              <div
                className={`${s.categoryButton}  ${
                  isDarkMode ? "dark-category-button" : "light-explore-nft"
                }`}
                onClick={() => onCategorySelect("Art")}
              >
                <img
                  src="/assets/art.svg"
                  title="Art"
                  loading="auto"
                  alt="logo"
                />
                <span>{t("filters.art")}</span>
              </div>
              <div
                className={`${s.categoryButton}  ${
                  isDarkMode ? "dark-category-button" : "light-explore-nft"
                }`}
                onClick={() => onCategorySelect("Painting")}
              >
                <img
                  src="/assets/painting.svg"
                  title="Painting"
                  loading="auto"
                  alt="logo"
                />
                <span>{t("filters.painting")}</span>
              </div>
              <div
                className={`${s.categoryButton}  ${
                  isDarkMode ? "dark-category-button" : "light-explore-nft"
                }`}
                onClick={() => onCategorySelect("PFP")}
              >
                <img
                  src="/assets/pfp.svg"
                  title="PFP"
                  loading="auto"
                  alt="logo"
                />
                <span>PFP</span>
              </div>
              <div
                className={`${s.categoryButton}  ${
                  isDarkMode ? "dark-category-button" : "light-explore-nft"
                }`}
                onClick={() => onCategorySelect("Photography")}
              >
                <img
                  src="/assets/photography.svg"
                  title="Photo"
                  loading="auto"
                  alt="logo"
                />
                <span>{t("filters.photography")}</span>
              </div>
              <div
                className={`${s.categoryButton}  ${
                  isDarkMode ? "dark-category-button" : "light-explore-nft"
                }`}
                onClick={() => onCategorySelect("Collectible")}
              >
                <img
                  src="/assets/trading-cards.svg"
                  title="Trading Cards"
                  loading="auto"
                  alt="logo"
                />
                <span>{t("filters.tradingCards")}</span>
              </div>
              <div
                className={`${s.categoryButton}  ${
                  isDarkMode ? "dark-category-button" : "light-explore-nft"
                }`}
                onClick={() => onCategorySelect("Video")}
              >
                <img
                  src="/assets/video.svg"
                  title="Picture"
                  loading="auto"
                  alt="logo"
                />
                <span>{t("filters.video")}</span>
              </div>
            </div>
            <h4 className={`${s.totalCounter}`}>
              {t("filters.totalItems")} {total}
            </h4>
          </div>
        </>
      )}
      <div className={`${s.filterContainer} d-flex align-items-center`}>
        <div className={s.switchesGroup}>
          <div className={s.filtersSwitch}>
            <div className="form-check form-switch">
              <input
                className={`form-check-input ${
                  isDarkMode ? "dark-lighter-checkbox" : ""
                }`}
                type="checkbox"
                checked={query.isNFTPRO ? true : false}
                onChange={onNftPROChange}
              />
              <label
                className={`form-check-label ${isDarkMode ? "light-font" : ""}`}
                htmlFor="nsfw"
              >
                SolSea
              </label>
            </div>
          </div>
          <div className={s.filtersSwitch}>
            <div className="form-check form-switch">
              <input
                className={`form-check-input ${
                  isDarkMode ? "dark-lighter-checkbox" : ""
                }`}
                type="checkbox"
                checked={query.verified ? true : false}
                onChange={onValidatedChange}
              />
              <label
                className={`form-check-label ${isDarkMode ? "light-font" : ""}`}
                htmlFor="nsfw"
              >
                {t("filters.verified")}
              </label>
            </div>
          </div>
          <div className={s.filtersSwitch}>
            <div className="form-check form-switch">
              <input
                className={`form-check-input ${
                  isDarkMode ? "dark-lighter-checkbox" : ""
                }`}
                type="checkbox"
                checked={!query.nsfw ? false : true}
                onChange={onNSFWChange}
              />
              <label
                className={`form-check-label ${isDarkMode ? "light-font" : ""}`}
                htmlFor="nsfw"
              >
                {t("filters.inclNSFW")}
              </label>
            </div>
          </div>
        </div>
        <div className={s.filtersGroup}>
          <div className={s.filters}>
            <div className={s.dropdown}>
              <Select
                styles={selectDarkMode}
                value={sortFilterDefaultValue()}
                name="sort"
                onChange={onSortChange}
                options={nftSortOptions}
                controlShouldRenderValue
                className={`${s.multiSelect} basic-multi-select`}
                classNamePrefix="select"
                getOptionLabel={e => t(e.label) || ""}
              />
            </div>
          </div>
          {byCollection && (
            <div className={s.filters}>
              <div className={s.dropdown}>
                <Select
                  styles={selectDarkMode}
                  // defaultValue={{ value: "default", label: "Single/Collection" }}
                  value={collectionFilterDefaultValue()}
                  name="collection"
                  onChange={onHasCollectionChange}
                  options={hasNftCollectionOptions}
                  className={`${s.multiSelect} basic-multi-select`}
                  classNamePrefix="select"
                  getOptionLabel={e => t(e.label) || ""}
                />
              </div>
            </div>
          )}
          <div className={s.filters}>
            <div className={s.dropdown}>
              <Select
                styles={selectDarkMode}
                isMulti
                name="tags"
                value={tagsFilterDefaultValue()}
                onChange={onTagChange}
                options={tagValues}
                className={`${s.multiSelect} basic-multi-select`}
                classNamePrefix="select"
                placeholder={t("filters.selectTags")}
              />
            </div>
          </div>
          <div className={s.filters}>
            <div className={s.dropdown}>
              <Select
                styles={selectDarkMode}
                isMulti
                name="licenses"
                value={licenseFilterDefaultValue()}
                onChange={onLicenseChange}
                options={licenseValues}
                className={`${s.multiSelect} basic-multi-select`}
                classNamePrefix="select"
                placeholder={t("mintNFT.selectLicense")}
              />
            </div>
          </div>
          {isInline && (
            <div className={s.filters}>
              <div>
                <input
                  ref={textRef}
                  onChange={onTextSearch}
                  type="text"
                  value={text}
                  placeholder={t("filters.searchByNft")}
                  className={`${
                    isDarkMode ? "dark-search-collection" : "light-white"
                  }`}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExploreFilters;

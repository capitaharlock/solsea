import useStyles from "isomorphic-style-loader/useStyles";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import Select from "react-select";
import s from "./CreatorFilters.scss";
import { useTranslation } from "react-i18next";

const CreatorFilters = ({
  query,
  setQuery,
  tags,
  licenses,
  sortOptions,
  // byCollection = true,
  isInline = false,
  total
}) => {
  const { isDarkMode } = useSelector(({ app }) => ({
    isDarkMode: app.isDarkMode
  }));
  let selectedTags = [];
  let selectedLicenses = [];

  const { t } = useTranslation();
  const textRef = useRef(null);
  const [text, setText] = useState(
    query && query.Title ? query.Title.$regex : ""
  );
  const [tagValues, setTagValues] = useState([]);
  const [licenseValues, setLicensesValues] = useState([]);

  const onTextSearch = e => {
    const input = e.currentTarget.value;
    setText(input);
    if (input && input !== "") {
      setQuery({
        ...query,
        Title: { $regex: input, $options: "i" }
      });
    } else {
      delete query["Title"];
      setQuery({
        ...query
      });
    }
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
  }, [tags]);
  useEffect(() => {
    loadLicenses();
  }, [licenses]);

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
  }

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
      const option = sortOptions.find(item => {
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

  // const collectionFilterDefaultValue = () => {
  //   if (query.nft_collection) {
  //     const fieldKey = Object.keys(query.nft_collection)[0];
  //     const option = hasNftCollectionOptions.find(item => {
  //       if (
  //         item.value.nft_collection &&
  //         item.value.nft_collection.hasOwnProperty(fieldKey)
  //       )
  //         return true;
  //       return false;
  //     });
  //     return option ? option : { value: "default", label: "Single/Collection" };
  //   } else {
  //     return { value: "default", label: "Single/Collection" };
  //   }
  // };

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
          <div className={`${s.searchContainer} d-flex align-items-center`}>
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
                  className={s.searchButton}
                  onClick={() => {
                    onTextSearch({ currentTarget: { value: "" } });
                    if (textRef && textRef.current) textRef.current.focus();
                  }}
                >
                  <i className="fa fa-close"></i>
                </div>
              ) : (
                <div className={s.searchButton}>
                  <i className="fa fa-search"></i>
                </div>
              )}
            </div>
            <h4 className={`${s.totalCounter}`}>
              {t("filters.totalItems")}
              {total}
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
                options={sortOptions}
                controlShouldRenderValue
                className={`${s.multiSelect} basic-multi-select`}
                classNamePrefix="select"
                getOptionLabel={e => t(e.label) || ""}
              />
            </div>
          </div>
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
            <div className={`dropdown ${s.dropdown}`}>
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
                    isDarkMode ? "dark-search-creator" : "light-white"
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

export default CreatorFilters;

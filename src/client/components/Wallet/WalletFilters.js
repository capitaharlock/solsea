import useStyles from "isomorphic-style-loader/useStyles";
import React, { useRef, useState } from "react";
import Select from "react-select";
import s from "./Wallet.scss";

const WalletFilters = ({
  query,
  setQuery,
  width,
  searchStyle,
  setSearchStyle,
  onChange,
  options,
  selectStyle
}) => {
  const timeoutId = useRef();
  const textRef = useRef(null);
  const [text, setText] = useState(
    query && query.Title ? query.Title.$regex : ""
  );

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

  useStyles(s);
  return (
    <>
      <Select
        className={`${
          searchStyle === true && width.w <= 600
            ? s.selectDisappear
            : width.w <= 600 && searchStyle === false
            ? s.optionsMobile
            : s.options
        }`}
        options={options}
        onChange={onChange}
        controlShouldRenderValue={true}
        styles={selectStyle}
      />
      <div
        onClick={e => {
          if (width.w <= 600) {
            e.stopPropagation();
            setSearchStyle(true);
          }
        }}
        className={`
          ${
            searchStyle === true && width.w <= 600
              ? s.largeSearch
              : width.w <= 600
              ? s.mobileSearchContainer
              : s.searchContainer
          }`}
      >
        <input
          ref={textRef}
          onChange={onTextSearch}
          className={`${s.searchInput}`}
          type="search"
          value={text}
          placeholder={
            width.w <= 600 && searchStyle === false
              ? ""
              : `Search for NFT here...`
          }
        ></input>
        <div className={s.searchIconContainer}>
          {text === "" && <img src="/assets/search.svg" />}
          {searchStyle === true && width.w <= 600 && (
            <img
              onClick={e => {
                e.stopPropagation();
                setSearchStyle(false);
              }}
              src="/assets/trash.svg"
            />
          )}
        </div>
      </div>
    </>
  );
};

export default WalletFilters;

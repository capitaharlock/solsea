import React, { useState, useRef } from "react";
import useStyles from "isomorphic-style-loader/useStyles";
import s from "../NavBarComponents.scss";
import SearchResultsNft from "./SearchResultsNft";
import SearchResultsCollection from "./SearchResultsCollection";
import { useSelector } from "react-redux";
import client from "../../../../services/feathers";

function NavSearch({ inputOpen, setInputOpen }) {
  const { isDarkMode } = useSelector(({ app }) => ({
    isDarkMode: app.isDarkMode,
    app,
  }));

  const searchInput = useRef(null);

  const [searchInputValue, setSearchInputValue] = useState("");
  const [searchedNft, setSearchedNft] = useState([]);
  const [searchedCollections, setSearchedCollections] = useState([]);
  useStyles(s);

  const getCollectionNftData = async (e) => {
    setSearchInputValue(e);
    if (e.length >= 3) {
      const nftListed = await client.service("nft-listed").find({
        query: {
          Title: { $regex: `\\b${e}`, $options: "i" },
        },
      });
      const collectionListed = await client.service("collections").find({
        query: {
          title: { $regex: `\\b${e}`, $options: "i" },
          $populate: ["headerImage", "iconImage"],
        },
      });
      setSearchedNft(nftListed.data.slice(0, 5));
      setSearchedCollections(collectionListed.data.slice(0, 5));
    } else {
      setSearchedNft([]);
      setSearchedCollections([]);
    }
  };

  const clear = () => {
    setSearchedNft([]);
    setSearchedCollections([]);
    setSearchInputValue("");
  };
  return (
    <div className={s.searchContainer}>
      <div className={` ${inputOpen ? s.mobileHiden : s.mobile} ${s.search} `}>
        <input
          ref={searchInput}
          onChange={(e) => getCollectionNftData(e.target.value)}
          placeholder="Type collection or NFT here..."
          value={searchInputValue}
        />
        <svg
          onClick={() => setInputOpen(!inputOpen)}
          width="19"
          height="19"
          viewBox="0 0 19 19"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            className={`${isDarkMode ? s.darkModesvg : ""}`}
            d="M17.8594 17.1953L13.3242 12.6602C13.2539 12.5898 13.1484 12.5547 13.043 12.5547H12.6562C13.8867 11.2188 14.625 9.49609 14.625 7.5625C14.625 3.55469 11.3203 0.25 7.3125 0.25C3.26953 0.25 0 3.55469 0 7.5625C0 11.6055 3.26953 14.875 7.3125 14.875C9.21094 14.875 10.9688 14.1367 12.2695 12.9414V13.293C12.2695 13.4336 12.3047 13.5391 12.375 13.6094L16.9102 18.1445C17.0859 18.3203 17.332 18.3203 17.5078 18.1445L17.8594 17.793C18.0352 17.6172 18.0352 17.3711 17.8594 17.1953ZM7.3125 13.75C3.86719 13.75 1.125 11.0078 1.125 7.5625C1.125 4.15234 3.86719 1.375 7.3125 1.375C10.7227 1.375 13.5 4.15234 13.5 7.5625C13.5 11.0078 10.7227 13.75 7.3125 13.75Z"
          />
        </svg>
      </div>
      <div
        onClick={() => searchInput.current.focus()}
        className={`  ${s.searchResultsContainers} ${isDarkMode ? s.searchResultsContainersDark : ""}`}
      >
        {searchedCollections.length > 0 ? (
          <div className={s.searchResults}>
            <p className={s.searchResultsHeader}>Collection</p>
            {searchedCollections.map((dataCollection) => {
              return <SearchResultsCollection key={dataCollection.Pubkey} {...dataCollection} clear={clear} />;
            })}
          </div>
        ) : null}
        {searchedNft.length > 0 ? (
          <div className={s.searchResults}>
            <p className={s.searchResultsHeader}>Nft</p>
            {searchedNft.map((dataNft) => {
              return <SearchResultsNft key={dataNft.Pubkey} dataNft={dataNft} clear={clear} />;
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default NavSearch;

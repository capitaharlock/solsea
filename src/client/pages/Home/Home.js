import React from "react";
import TitleAbove from "../../components/TitleAbove/TitleAbove";
import client from "../../services/feathers";
import s from "./Home.scss";
import { useDispatch, useSelector } from "react-redux";
import withStyles from "isomorphic-style-loader/withStyles";
import {
  getHomeData,
  SET_POPULAR_NFTS,
  SET_RECENT_NFTS
} from "../../actions/pages";
import Seo from "../../components/Seo/Seo";
import { useClientLoading } from "../../hooks/useClientLoading";
import Loader from "../../components/Loader/Loader";
import UpcomingCollections from "./Sections/UpcomingCollections/UpcomingCollections";
import CollectionSection from "./Sections/CollectionSection/CollectionSection";
import { useTileSize } from "../../hooks/useTileSize";
import { NftTilesLayout } from "../../layout/NftTilesLayout";
import { useTranslation } from "react-i18next";
import SaleHistoryItem from "../../components/SaleHistoryItem/SaleHistoryItem";
import AboveFooter from "./Sections/AboveFooterSection/AboveFooter";
import AboveTheFold from "./Sections/AboveTheFold/AboveTheFold";
import BelowTheFold from "./Sections/BelowTheFold/BelowTheFold";
import Banner from "../../components/ForBanners/Banner";
import ExternalBanner from "../../components/ForBanners/ExternalBanner";
import { SET_HOME_SALES_HISTORY } from "../../actions/saleshistory";
import NftItem from "../../components/NftItem/NftItem";
import {
  handleLoadTopVolume,
  handleLoadAllStars,
  handleLoadHotArtists,
  handleLoadUpcomingCollections,
  handleLoadUniqueArtists
} from "../../actions/collections";

const Home = () => {
  const { t } = useTranslation();
  const {
    popularNfts,
    recentNfts,
    recentSales,
    isDarkMode,
    app,
    topVolume = [],
    allStars = [],
    hotCollections = [],
    hotArtists = [],
    uniqueArtists = [],
    upcomingCollections = []
  } = useSelector(({ nfts, collections, saleshistory, app }) => ({
    popularNfts: nfts.popularNfts,
    recentNfts: nfts.recentNfts,
    isDarkMode: app.isDarkMode,
    recentSales: saleshistory.recentSales,
    isInitialRender: app.isInitialRender,
    topVolume: collections.topVolume,
    allStars: collections.allStars,
    hotCollections: collections.hotCollections,
    hotArtists: collections.hotArtists,
    uniqueArtists: collections.uniqueArtists,
    upcomingCollections: collections.upcomingCollections,
    app
  }));

  const dispatch = useDispatch();

  const loadNFTs = async () => {
    try {
      const res = await client.service("nft-listed").find({
        query: {
          nsfw: { $in: [false, null] },
          listed: true,
          verified: true,
          isPrivateSale: false,
          $limit: 14,
          views: { $gt: 100 }
        }
      });
      const res2 = await client.service("nft-listed").find({
        query: {
          nsfw: { $in: [false, null] },
          listed: true,
          isPrivateSale: false,
          $limit: 14,
          ignoreStakeSort: true,
          $sort: {
            listedAt: -1
          }
        }
      });
      const res3 = await client.service("listed-archive").find({
        query: {
          status: "SOLD",
          $sort: {
            createdAt: -1
          },
          listed: false,
          $limit: 6
        }
      });
      let result = [];
      if (res.data.length > 14) {
        for (let i = 0; i < 14; ) {
          const rand = Math.floor(Math.random() * res.data.length);
          if (!result.find(x => x.Pubkey === res.data[rand].Pubkey)) {
            i++;
            result.push(res.data[rand]);
          }
        }
      } else {
        result = res.data;
      }
      let result2 = [];
      if (res2.data.length > 14) {
        for (let i = 0; i < 14; ) {
          const rand = Math.floor(Math.random() * res2.data.length);
          if (!result2.find(x => x.Pubkey === res2.data[rand].Pubkey)) {
            i++;
            result2.push(res2.data[rand]);
          }
        }
      } else {
        result2 = res2.data;
      }
      let result3 = [];
      if (res3.data.length > 6) {
        for (let i = 0; i < 6; ) {
          const rand = Math.floor(Math.random() * res3.data.length);
          if (!result3.find(x => x.Pubkey === res3.data[rand].Pubkey)) {
            i++;
            result3.push(res3.data[rand]);
          }
        }
      } else {
        result3 = res3.data;
      }
      dispatch({
        type: SET_POPULAR_NFTS,
        payload: result
      });
      dispatch({
        type: SET_RECENT_NFTS,
        payload: result2
      });
      dispatch({
        type: SET_HOME_SALES_HISTORY,
        payload: result3
      });
    } catch (error) {
      // console.log(error);
    }
  };

  const isLoading = useClientLoading({
    load: loadNFTs,
    isInitialRender: app.isInitialRender,
    params: {}
  });

  // const [listedContainerRef, listedTileSize] = useTileSize();

  return (
    <div>
      <Seo
        title={`Solsea | ${t("seo.home")}`}
        imageUrl="https://solsea.io/SOLSEA.png"
        url="https://solsea.io"
        description={t("seo.homeDescription")}
      />
      {!app.isInitialRender && isLoading ? (
        <Loader />
      ) : (
        <>
          {/* <section
            className={`${s.nftSection} ${
              isDarkMode ? "dark" : "light-grey"
            } d-flex section-padding`}
          >
            <div className={`container`}>
              <div className={`title-above`}>
                <TitleAbove title={t("homepage.recentSales")} emoji={`🛒`} />
              </div>
              <div className={`sales-nft-global`}>
                {recentSales &&
                  recentSales.length > 0 &&
                  recentSales.map(nft => (
                    <div key={`${nft._id}_${nft.sellerKey}_${nft.updatedAt}`}>
                      <SaleHistoryItem {...nft} />
                    </div>
                  ))}
              </div>
            </div>
          </section> */}
          {/* <section
            className={`${s.nftSection} ${
              isDarkMode ? "dark" : "light-grey"
            } d-flex section-padding`}
          >
            <div className={`container`}>
              <div className={`title-above`}>
                <TitleAbove title={t("homepage.latestListings")} emoji={`⏰`} />
              </div>
              <div className={`nft-global`}>
                {recentNfts.map(nft => (
                  <>
                    <NftItem {...nft} />
                  </>
                ))}
              </div>
            </div>
          </section> */}

          <section
            aria-label="section"
            className={`${s.textLight} ${
              isDarkMode ? "dark" : "light"
            } overflow-hidden section-padding`}
          >
            <AboveTheFold />
          </section>

          <section
            className={`${s.lineSection} ${
              isDarkMode ? "dark" : "light"
            } section-padding`}
          >
            <BelowTheFold />
          </section>

          {/* <section className={`${isDarkMode ? "dark" : ""}`}>
            <div className={`${s.theFirstHundred} container`}>
              <ExternalBanner
                url={
                  "https://allart.medium.com/the-all-art-circle-nft-collection-af13b7dacc41"
                }
                imageUrl={`/assets/nftCircle.jpg`}
                alt={`Circle Collection`}
              />
            </div>
          </section> */}

          <section
            className={`${s.bannerPoster} container ${
              isDarkMode ? "dark" : "light"
            }`}
          >
            <Banner
              url={`/collection/61cdb2c6f3b710948748f3df`}
              mobileImageUrl={"/assets/CircleBanner.jpg"}
              imageUrl={`/assets/CircleBanner.jpg`}
              alt={`Circle Collection`}
            />
          </section>

          <section className={`container ${isDarkMode ? "dark" : ""}`}>
            <div className={`row`}>
              <UpcomingCollections
                data={upcomingCollections}
                app={app}
                title={t("homepage.upcoming")}
                emoji={`👀`}
                loadCollectionFunction={handleLoadUpcomingCollections}
              />
            </div>
          </section>

          {/* <section className={`${isDarkMode ? "dark" : ""}`}>
            <div className={`${s.theFirstHundred} container`}>
              <ExternalBanner
                url={"https://shrinakurani.solsea.io/"}
                imageUrl={`/assets/SHRINA_KURANI_Solsea_Banner3.jpg`}
                alt={`Shrina`}
              />
            </div>
          </section> */}

          <section
            className={`${s.bannerPoster} container ${
              isDarkMode ? "dark" : "light"
            }`}
          >
            <Banner
              url={`/collection/61b75ee47362cf61b1b987e7`}
              mobileImageUrl={"/assets/100_Solsea_Banner_Mobile.jpg"}
              imageUrl={`/assets/100_Solsea_Banner_full.jpg`}
              alt={`The Hundred`}
            />
          </section>

          <section
            className={`${s.backgroundCollection} ${
              isDarkMode ? "dark" : "light"
            } d-flex section-padding`}
          >
            <div className={`container`}>
              <div className={`d-flex container`}>
                <div className={`row`}>
                  <CollectionSection
                    data={allStars}
                    app={app}
                    title={t("homepage.allStars")}
                    emoji={`⭐`}
                    numOfItems={4}
                    loadCollectionFunction={handleLoadAllStars}
                    color="yellow"
                  />
                </div>
              </div>
            </div>
          </section>

          <section
            className={`${s.backgroundCollection} ${
              isDarkMode ? "dark" : "light"
            } d-flex section-padding`}
          >
            <div className={`container`}>
              <div className={`d-flex container`}>
                <div className={`row`}>
                  <CollectionSection
                    data={topVolume}
                    app={app}
                    title={t("homepage.topVolume")}
                    emoji={`🔝`}
                    numOfItems={8}
                    loadCollectionFunction={handleLoadTopVolume}
                    color="blue"
                  />
                </div>
              </div>
            </div>
          </section>

          <section
            className={`${s.backgroundCollection} ${
              isDarkMode ? "dark" : "light"
            } d-flex section-padding`}
          >
            <div className={`container`}>
              <div className={`row`}>
                <UpcomingCollections
                  data={uniqueArtists}
                  app={app}
                  title={t("homepage.uniqueArtist")}
                  emoji={`🎨`}
                  isSliceData={true}
                  numOfItem={5}
                  loadCollectionFunction={handleLoadUniqueArtists}
                />
              </div>
            </div>
          </section>

          <section
            className={`${s.backgroundCollection} ${
              isDarkMode ? "dark" : "light"
            } d-flex section-padding`}
          >
            <div className={`container`}>
              <div className={`d-flex container`}>
                <div className={`row`}>
                  <CollectionSection
                    data={hotArtists}
                    app={app}
                    title={t("homepage.hotArtists")}
                    emoji={`🌶️`}
                    numOfItems={8}
                    loadCollectionFunction={handleLoadHotArtists}
                    color="red"
                  />
                </div>
              </div>
            </div>
          </section>

          <section
            className={`${s.nftSection} ${
              isDarkMode ? "dark" : "light-grey"
            } d-flex section-padding`}
          >
            <div className={`container`}>
              <div className={`title-above`}>
                <TitleAbove title={t("homepage.latestListings")} emoji={`⏰`} />
              </div>
              <div className={`nft-global`}>
                {recentNfts.map(nft => (
                  <>
                    <NftItem {...nft} />
                  </>
                ))}
              </div>
              {/* <div ref={listedContainerRef} className={s.nftItems}>
                {
                  <NftTilesLayout
                    nfts={recentNfts}
                    className={`d-flex col-lg-3 col-md-6 col-sm-6 col-xs-12 ${s.popularNfts}`}
                    tileSize={listedTileSize}
                  />
                }
              </div> */}
            </div>
          </section>

          {/* <section
            className={`${s.nftSection} ${
              isDarkMode ? "dark" : "light-grey"
            } d-flex section-padding`}
          >
            <div className={`container`}>
              <div className={`title-above`}>
                <TitleAbove title={t("homepage.recentSales")} emoji={`🛒`} />
              </div>
              <div className={`d-flex ${s.salesHistoryContainer}`}>
                {recentSales &&
                  recentSales.length > 0 &&
                  recentSales.map(nft => (
                    <div
                      key={`${nft._id}_${nft.sellerKey}_${nft.updatedAt}`}
                      className={`d-flex col-lg-4 col-md-4 col-sm-4 col-xs-4 ${s.saleItem}`}
                    >
                      <SaleHistoryItem {...nft} />
                    </div>
                  ))}
              </div>
            </div>
          </section> */}

          <section
            className={`${s.nftSection} ${
              isDarkMode ? "dark" : "light-grey"
            } d-flex section-padding`}
          >
            <div className={`container`}>
              <div className={`title-above`}>
                <TitleAbove title={t("homepage.recentSales")} emoji={`🛒`} />
              </div>
              <div className={`sales-nft-global`}>
                {recentSales &&
                  recentSales.length > 0 &&
                  recentSales.map(nft => (
                    <div key={`${nft._id}_${nft.sellerKey}_${nft.updatedAt}`}>
                      <SaleHistoryItem {...nft} />
                    </div>
                  ))}
              </div>
            </div>
          </section>

          <section
            className={`${s.nftSection} ${
              isDarkMode ? "dark" : "light"
            } d-flex section-padding`}
          >
            <div className={`container`}>
              <div className={`title-above`}>
                <TitleAbove title={t("homepage.popularNft")} emoji={`🚀`} />
              </div>
              <div className={`nft-global`}>
                {popularNfts.map(nft => (
                  <>
                    <NftItem {...nft} />
                  </>
                ))}
              </div>
              {/* <div className={s.nftItems}>
                {
                  <NftTilesLayout
                    nfts={popularNfts}
                    className={`d-flex col-lg-3 col-md-6 col-sm-6 col-xs-12 ${s.popularNfts}`}
                    tileSize={listedTileSize}
                  />
                }
              </div> */}
            </div>
          </section>

          <section
            className={`${s.backgroundCollection} ${
              isDarkMode ? "dark" : "light-grey"
            } d-flex section-padding`}
          >
            <div className="container">
              <AboveFooter />
            </div>
          </section>
        </>
      )}
    </div>
  );
};

const loadData = (store, params, query, path, req) => {
  return store.dispatch(getHomeData(params, req));
};

export default {
  loadData,
  component: withStyles(s)(Home)
};

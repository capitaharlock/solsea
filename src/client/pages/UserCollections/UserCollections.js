import React, { useEffect, useState } from "react";
import client from "../../services/feathers";
import s from "./UserCollections.scss";
// import { useRouteMatch } from "react-router";
import Seo from "../../components/Seo/Seo";
import withStyles from "isomorphic-style-loader/withStyles";
import { SET_USER_COLLECTION } from "../../actions/pages";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/Loader/Loader";
import { useRouteMatch } from "react-router";
import UserCollectionItem from "../../components/UserCollectionItem/UserCollectionItem";
import { useTranslation } from "react-i18next";

const UserCollections = () => {
  const { isDarkMode } = useSelector(({ app }) => ({
    isDarkMode: app.isDarkMode
  }));

  const [isLoading, setLoading] = useState(false);
  const { collection, user } = useSelector(({ collections, user, app }) => ({
    collection: collections.collection,
    user: user,
    app
  }));

  const { t } = useTranslation();

  const match = useRouteMatch();

  const dispatch = useDispatch();

  const loadCollections = async () => {
    setLoading(true);
    try {
      const res = await client.service("collections").find({
        query: {
          user: match.params.userId,
          $sort: {
            createdAt: 1
          },
          $populate: ["headerImage", "iconImage"]
        }
      });

      setLoading(false);
      dispatch({
        type: SET_USER_COLLECTION,
        payload: res.data
      });
    } catch (error) {
      // console.log(error);
    }
  };

  useEffect(() => {
    if (user && user.connected && user.isLoggedIn) {
      loadCollections();
    }
  }, [user]);

  return (
    <div>
      <Seo title={`Solsea | ${t("seo.userCollections")}`} />

      <section
        aria-label="section"
        className={`banner profile-banner d-flex ${
          isDarkMode ? "dark-lighter" : "light-white"
        }`}
      >
        <h1>{t("navbar.myCollections")}</h1>
      </section>

      <div className="container page-wrapper position-relative">
        <div className={`row ${s.collectionWrapper} `}>
          {user && user.connected && user.isLoggedIn ? (
            isLoading ? (
              <Loader />
            ) : (
              collection.map(collection => (
                <UserCollectionItem
                  key={collection._id}
                  {...collection}
                  displayDate={false}
                />
              ))
            )
          ) : (
            <div>
              <h4
                className={`pt-5 connect-wallet-text`}
                style={{ textAlign: "center" }}
              >
                {t("mintNFT.connectFirst")}
              </h4>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default { component: withStyles(s)(UserCollections) };

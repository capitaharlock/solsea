import useStyles from "isomorphic-style-loader/useStyles";
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { handleLoadFreshCollections } from "../../../../actions/collections";
import { useFilePath } from "../../../../hooks/useFilePath";
import s from "./FreshCollections.scss";

const FreshCollections = () => {
  useStyles(s);
  const { freshCollections = [], app } = useSelector(
    ({ collections, app }) => ({
      freshCollections: collections.freshCollections,
      app
    })
  );

  const dispatch = useDispatch();
  useEffect(() => {
    if (!app.isInitialRender) loadFreshCollections();
  }, [app]);

  const loadFreshCollections = async () => {
    dispatch(handleLoadFreshCollections());
  };

  const [fresh] = useMemo(() => {
    if (freshCollections) {
      const fresh = freshCollections.slice(0, 6);
      return [fresh, freshCollections];
    }
    return [];
  }, [freshCollections]);

  return fresh.length > 0
    ? fresh.map(collection => (
        <FreshCollectionItem key={collection._id} {...collection} />
      ))
    : null;
};

const FreshCollectionItem = ({ _id, iconImage, title }) => {
  const { isDarkMode } = useSelector(({ app }) => ({
    isDarkMode: app.isDarkMode
  }));

  const { path: iconImagePath } = useFilePath({
    destination: iconImage && iconImage.s3 && iconImage.s3.thumbnail
  });

  return (
    <div className={`${s.freshContainer} col-lg-4 col-md-4 col-sm-4 col-4`}>
      <Link to={`/collection/${_id}`}>
        <div
          className={`${s.iconContainer} ${
            isDarkMode ? "dark-fresh" : ""
          }  d-flex`}
        >
          <img
            className={`${isDarkMode ? "dark-box-shadow" : ""}`}
            src={iconImagePath}
            alt={""}
          />
          <div className={s.titleContainer}>
            <span>{title}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default FreshCollections;

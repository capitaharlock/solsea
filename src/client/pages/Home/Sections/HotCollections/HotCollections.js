import useStyles from "isomorphic-style-loader/useStyles";
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
// import { shortMonths } from "../../../../../api/months";
import { handleLoadHotCollections } from "../../../../actions/collections";
import CollectionItem from "../../../../components/CollectionItem/CollectionItem";
import { useFilePath } from "../../../../hooks/useFilePath";
import s from "./HotCollections.scss";

const HotCollections = () => {
  useStyles(s);
  const { hotCuratedCollections = [], app } = useSelector(
    ({ collections, app }) => ({
      hotCuratedCollections: collections.hotCuratedCollections,
      app
    })
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (!app.isInitialRender) loadHotCollections();
  }, [app]);

  const loadHotCollections = async () => {
    dispatch(handleLoadHotCollections());
  };

  const [topCollections, otherCollections] = useMemo(() => {
    if (hotCuratedCollections) {
      const topCollections = hotCuratedCollections.slice(0, 5);
      return [topCollections, hotCuratedCollections];
    }
    return [];
  }, [hotCuratedCollections]);

  return (
    <>
      {topCollections.map(collection => (
        <HotCollectionItem key={collection._id} {...collection} />
      ))}
      <div className={`${s.collectionSection} d-flex container`}>
        <div className="row">
          {otherCollections.map((collection, index) => (
            <div
              key={index}
              className={`d-flex col-lg-4 col-md-6 col-sm-6 col-xs-12`}
            >
              <CollectionItem {...collection} displayDate={false} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const HotCollectionItem = ({ _id, promotionProtraitImage }) => {
  const { isDarkMode } = useSelector(({ app }) => ({
    isDarkMode: app.isDarkMode
  }));
  const { path: promotionProtraitImagePath } = useFilePath({
    destination:
      promotionProtraitImage &&
      promotionProtraitImage.s3 &&
      promotionProtraitImage.s3.thumbnail
  });

  return (
    <div className={`${s.poster} ${s.hotCollectionItem} pb-4`}>
      <Link to={`/collection/${_id}`}>
        <img
          className={isDarkMode ? "dark-poster-container" : ""}
          src={promotionProtraitImagePath}
          alt={""}
        />
      </Link>
    </div>
  );
};

export default HotCollections;

import useStyles from "isomorphic-style-loader/useStyles";
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import TitleAbove from "../../../../components/TitleAbove/TitleAbove";
import { useFilePath } from "../../../../hooks/useFilePath";
import s from "./UpcomingCollections.scss";

const UpcomingCollections = ({
  data,
  app,
  title,
  emoji,
  isSliceData,
  numOfItem,
  loadCollectionFunction
}) => {
  useStyles(s);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!app.isInitialRender) loadHotCollections();
  }, [app]);

  const loadHotCollections = async () => {
    dispatch(loadCollectionFunction());
  };

  const [sliceData] = useMemo(() => {
    if (data) {
      const sliceData = data.slice(0, numOfItem);
      return [sliceData, data];
    }
    return [];
  }, [data]);

  return data.length > 0 ? (
    <>
      <div className={`title-above`}>
        <TitleAbove title={title} emoji={emoji} />
      </div>
      {isSliceData === true
        ? sliceData.map(collection => (
            <UpcomingCollectionItem key={collection._id} {...collection} />
          ))
        : data.map(collection => (
            <UpcomingCollectionItem key={collection._id} {...collection} />
          ))}
    </>
  ) : null;
};

const UpcomingCollectionItem = ({ _id, promotionProtraitImage }) => {
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
    <div className={`${s.poster} col-lg-2 col-md-4 col-sm-4 col-4`}>
      <Link to={`/collection/${_id}`}>
        <img
          className={`${isDarkMode ? "dark-box-shadow" : ""}`}
          src={promotionProtraitImagePath}
          alt={""}
        />
      </Link>
    </div>
  );
};

export default UpcomingCollections;

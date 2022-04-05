import useStyles from "isomorphic-style-loader/useStyles";
import React, { useEffect, useMemo, useCallback } from "react";
import { useDispatch } from "react-redux";
import CollectionItem from "../../../../components/CollectionItem/CollectionItem";
import TitleAbove from "../../../../components/TitleAbove/TitleAbove";
import s from "./CollectionSection.scss";

const CollectionSection = ({
  data,
  app,
  title,
  emoji,
  numOfItems,
  loadCollectionFunction,
  color
}) => {
  useStyles(s);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!app.isInitialRender) loadTopVolume();
  }, [app]);

  const loadTopVolume = async () => {
    dispatch(loadCollectionFunction());
  };

  const [sliceData] = useMemo(() => {
    if (data) {
      const sliceData = data.slice(0, numOfItems);
      return [sliceData, data];
    }
    return [];
  }, [data]);

  const handleBgColor = useCallback(
    color => {
      if (color === "red") {
        return `${s.rowRed}`;
      } else if (color === "blue") {
        return `${s.rowBlue}`;
      } else if (color === "yellow") {
        return `${s.rowYellow}`;
      }
    },
    [color]
  );

  return sliceData.length > 0 ? (
    <div
      className={`collection-section d-flex container ${handleBgColor(color)}`}
    >
      <div className={`title-above`}>
        <TitleAbove title={title} emoji={emoji} />
      </div>
      <div className={`${s.topVolumeContainer} row`}>
        {sliceData.map((collection, index) => (
          <div
            key={index}
            className={`d-flex col-lg-3 col-md-6 col-sm-6 col-xs-12`}
          >
            <CollectionItem {...collection} displayDate={false} />
          </div>
        ))}
      </div>
    </div>
  ) : null;
};

export default CollectionSection;

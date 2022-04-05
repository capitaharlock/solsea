import useStyles from "isomorphic-style-loader/useStyles";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { handleLoadCreators } from "../../../../actions/creators";
import TitleAbove from "../../../../components/TitleAbove/TitleAbove";
import { useFilePath } from "../../../../hooks/useFilePath";
import s from "./CreatorsSection.scss";

const CreatorsSection = () => {
  const { t } = useTranslation();
  useStyles(s);
  const { creators = [], isDarkMode, app } = useSelector(
    ({ creators, app }) => ({
      creators: creators.homeCreators,
      isDarkMode: app.isDarkMode,
      app
    })
  );

  const dispatch = useDispatch();

  const loadCreators = () => {
    dispatch(handleLoadCreators());
  };

  useEffect(() => {
    if (!app.isInitialRender) {
      loadCreators();
    }
  }, []);

  return (
    <section
      className={`section-padding ${s.section}  ${
        isDarkMode ? "dark" : "light-white"
      }`}
    >
      <div className="container">
        <div className={`${s.title} title-above`}>
          <TitleAbove title={`${t("creators.trending")}`} emoji={`🎨`} />
        </div>
        <div className="row">
          {creators.map((creator, index) => (
            <div className="col-md-3 col-sm-6 col-xs-12" key={index}>
              <CreatorItem {...creator} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CreatorItem = ({ profile = {}, _id }) => {
  const { isDarkMode } = useSelector(({ app }) => ({
    isDarkMode: app.isDarkMode
  }));
  const { path: profileImage } = useFilePath({
    destination:
      profile &&
      profile.profileImage &&
      profile.profileImage.s3 &&
      profile.profileImage.s3.thumbnail
  });

  const { path: headerImage } = useFilePath({
    destination:
      profile &&
      profile.headerImage &&
      profile.headerImage.s3 &&
      profile.headerImage.s3.thumbnail
  });
  return (
    <Link
      to={"/creator/" + _id + "/nfts"}
      className={`${s.root} ${isDarkMode ? "dark-box-shadow" : "light"}`}
    >
      <div className={s.headerImage}>
        <img src={headerImage} />
        <div className={s.profileImage}>
          <img src={profileImage} />
        </div>
      </div>
      <div className={s.info}>
        <div className={s.text}>
          <h4>{profile.name}</h4>
        </div>
      </div>
    </Link>
  );
};

export default CreatorsSection;

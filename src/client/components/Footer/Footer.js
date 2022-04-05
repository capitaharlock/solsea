import withStyles from "isomorphic-style-loader/withStyles";
import React from "react";
import s from "./Footer.scss";
import { useTranslation } from "react-i18next";
import {BsDiscord} from 'react-icons/bs';
import {AiOutlineTwitter, AiFillMediumCircle} from 'react-icons/ai';
import {Link} from 'react-router-dom';

const Footer = () => {
  const { t } = useTranslation();
  return ( 
    <footer className={`${s.footerDark}`}>
      
      <div className="container">

        <div className="row">

          {/*Solsea logo and text */}
          <div className="col-12 col-lg-4 col-md-12 col-sm-12">
            <div className={`${s.widget} d-flex`}>
              <div className={s.footerLogo}>
                <img src="/assets/solsea_Logo_RGB_final1.svg" alt=""/>

                <p>{t("footer.footerText")}</p>
                 
              </div>
              <p className={s.copyright}>© All rights reserved | SolSea.io 2022</p>
            </div>
             
          </div>

          
{/*<div className="col-md-2 col-sm-6 col-xs-1"></div> */}



{/*Nfts */}
          <div className="col-6 col-lg-2 col-md-3 col-sm-6">
            <div className={`${s.widget} d-flex`}>
              <h5>Explore</h5>
              <ul>
                {/* <li>
                  <Link to="#">About</Link>
                </li> */}
                <li>
                  <Link to="/explore">
                     {t("NFTs")}
                  </Link>
                </li>
                <li>
                  <Link to="/collections">
                     {t("Collections")}
                  </Link>
                </li>
                <li>
                  <Link to="/collection-statistics" 
                  >
                     {t("Stats")}
                  </Link>
                </li>
                <li>
                  <Link to="/collection-calendar" 
                  >
                     {t("Calendar")}
                  </Link>
                </li>
                <li>
                  <Link to="/collection/61b75ee47362cf61b1b987e7">
                     {t("The First 100")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>


{/*Create */}

          <div className="col-6 col-lg-2  col-md-3 col-sm-6">
            <div className={`${s.widget} d-flex`}>
              <h5>Create</h5>
              <ul>
                <li>
                  <Link to="/create" >
                    {t("Connect wallet")}
                  </Link>
                </li>
                <li>
                  <Link to="/create-collection">
                    {t("NFTs")}
                  </Link>
                </li>
                <li>
                  <Link to="/create-collection.medium.com">
                    {t("medium")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>



{/*General */}

          <div className="col-6 col-lg-2  col-md-3 col-sm-6">
            <div className={`${s.widget} d-flex`}>
              <h5>General</h5>
              <ul>
                <li>
                  <a
                    href="https://docs.solsea.io/getting-started/faq"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t("FAQ")}
                  </a>
                </li>
                <li>
                  <a
                    href="https://docs.solsea.io/getting-started/how-to-spot-a-fake-nft"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t("How to spot fake?")}
                  </a>
                </li>
                <li>
                  <a
                    href="https://docs.solsea.io/getting-started/terms-and-conditions"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t("Terms & Conditions")}
                  </a>
                </li>
                <li>
                  <a
                    href="https://docs.solsea.io/getting-started/privacy-policy"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t("Privacy Policy")}
                  </a>
                </li>
                <li>
                  <a
                    href="https://all.art/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t("ALL.ART Protocol")}
                  </a>
                </li>
              </ul>
            </div>
          </div>



          {/*Community */}
          <div className="col-6 col-lg-2 col-md-3 col-sm-6">
            <div className={`${s.widget} d-flex`}>
              <h5>{t("footer.community")}</h5>
              <ul>
                <li>
                  <a
                    href="https://discord.gg/DXYtfjyAPE"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <i> <img src="assets/discord.svg" alt="discord"/> </i>
                    {t("footer.discord")} 
                  </a>
                </li>
                <li >
                  <a
                    href="https://twitter.com/SolSeaNFT"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <i> <img src="assets/twitter.svg" alt="twitter" /> </i>
                    {t("footer.twitter")} 
                  </a>
                </li>
                <li>
                  <a
                    href="https://allart.medium.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <AiFillMediumCircle/> {t("footer.medium")}
                  </a>
                </li>
              </ul>
            </div>
          </div>

        </div> 
      </div>
    </footer> 
  );
};

export default withStyles(s)(Footer);
